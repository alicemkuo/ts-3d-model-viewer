/****************************************************************************
* VCGLib                                                            o o     *
* Visual and Computer Graphics Library                            o     o   *
*                                                                _   O  _   *
* Copyright(C) 2004-2017                                           \/)\/    *
* Visual Computing Lab                                            /\/|      *
* ISTI - Italian National Research Council                           |      *
*                                                                    \      *
* All rights reserved.                                                      *
*                                                                           *
* This program is free software; you can redistribute it and/or modify      *
* it under the terms of the GNU General Public License as published by      *
* the Free Software Foundation; either version 2 of the License, or         *
* (at your option) any later version.                                       *
*                                                                           *
* This program is distributed in the hope that it will be useful,           *
* but WITHOUT ANY WARRANTY; without even the implied warranty of            *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             *
* GNU General Public License (http://www.gnu.org/licenses/gpl.txt)          *
* for more details.                                                         *
*                                                                           *
****************************************************************************/

#ifndef _VCGLIB_VORONOI_REMESHER_H
#define _VCGLIB_VORONOI_REMESHER_H

#include <vcg/complex/complex.h>
#include <vcg/complex/algorithms/update/topology.h>
#include <vcg/complex/algorithms/refine.h>
#include <vcg/complex/algorithms/clean.h>
#include <vcg/complex/algorithms/voronoi_processing.h>
#include <vcg/complex/algorithms/point_sampling.h>
#include <vcg/complex/algorithms/crease_cut.h>
#include <vcg/complex/algorithms/curve_on_manifold.h>

#include <memory>
#include <string>
#include <vector>
#include <map>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <array>
#include <utility>


//#define DEBUG_VORO 1
//#include <QElapsedTimer>

#ifdef DEBUG_VORO
#include <wrap/io_trimesh/export.h>
#include <QString>
#endif

namespace vcg {
namespace tri {

class VoroEdgeMeshAux
{
	class EmEdgeType;
	class EmVertexType;
	class EUsedTypes : public vcg::UsedTypes<vcg::Use<EmVertexType>::AsVertexType,
	                                         vcg::Use<EmEdgeType>::AsEdgeType> {};
	class EmVertexType : public vcg::Vertex<EUsedTypes
	                          , vcg::vertex::Coord3d
	                          , vcg::vertex::BitFlags
	                          , vcg::vertex::VEAdj> {};
	class EmEdgeType   : public vcg::Edge<EUsedTypes
	        , vcg::edge::VertexRef
	        , vcg::edge::BitFlags
	        , vcg::edge::EEAdj
	        , vcg::edge::VEAdj> {};
public:
	class EdgeMeshType : public vcg::tri::TriMesh<std::vector<EmVertexType>, std::vector<EmEdgeType> >
	{
	public:
		~EdgeMeshType()
		{
			this->Clear();
			this->ClearAttributes();
		}
	};
};

template <class MeshType>
class Remesher
{
public:
	typedef Remesher                  ThisType;

	typedef MeshType                      Mesh;
	typedef typename Mesh::ScalarType     ScalarType;
	typedef typename Mesh::CoordType      CoordType;
	typedef typename Mesh::FaceType       FaceType;
	typedef typename Mesh::FacePointer    FacePointer;
	typedef typename Mesh::VertexType     VertexType;
	typedef typename Mesh::VertexPointer  VertexPointer;
	typedef typename Mesh::FaceIterator   FaceIterator;
	typedef typename Mesh::VertexIterator VertexIterator;

	typedef std::shared_ptr<Mesh>         MeshPtr;

protected:
	typedef face::Pos<FaceType>                    PosType;

	typedef typename VoroEdgeMeshAux::EdgeMeshType EdgeMeshType;

	/// \brief splitCC split the provided mesh into connected components.
	/// \param mesh the inputMesh.
	/// \return the vector of connected components (meshes) for the input model
	/// (if the input mesh is a single connected component returns an empty vector).
	///
	inline static std::vector<MeshPtr> splitCC(MeshType & mesh)
	{
		std::vector<MeshPtr> ret;

		// find the connected components
		std::vector<std::pair<int, typename MeshType::FacePointer> > CCV;
		Clean<MeshType>::ConnectedComponents(mesh, CCV);

		if (CCV.size() == 1)
			return ret;
		for(size_t i=0; i<CCV.size(); ++i)
		{
			UpdateSelection<MeshType>::Clear(mesh);
			CCV[i].second->SetS();
			UpdateSelection<MeshType>::FaceConnectedFF(mesh);
			ret.push_back(std::make_shared<MeshType>());
			Append<MeshType, MeshType>::MeshCopy(*(ret.back()), mesh, true);
		}

		return ret;
	}

public:
	static const int VoroRelaxationStep = 20;

	///
	/// \brief Remesh the main function that remeshes a mesh preserving creases.
	/// \param original the mesh
	/// \param samplingRadius is the sampling ragius for remeshing
	/// \param borderCreaseAngleDeg is the angle treshold for preserving corner points on the mesh boundary
	/// \param internalCreaseAngleDeg is the angle treshold for preserving creases on the mesh surface (if this value is < 0 it is set to borderCreaseAngleDeg)
	/// \return the remeshed mesh
	///
	static inline MeshPtr Remesh(Mesh & original, const ScalarType samplingRadius, const ScalarType borderCreaseAngleDeg = 0.0, const ScalarType internalCreaseAngleDeg = -1.0)
	{
		RequireFFAdjacency(original);
		RequireVFAdjacency(original);

		UpdateTopology<Mesh>::FaceFace(original);
		UpdateFlags<Mesh>::FaceBorderFromFF(original);
		UpdateFlags<Mesh>::VertexBorderFromFaceAdj(original);

		if (Clean<Mesh>::CountNonManifoldEdgeFF(original) > 0)
		{
			std::cout << "Input mesh has non manifold edges" << std::endl;
			return nullptr;
		}

		const ScalarType borderAngleDeg = std::max(ScalarType(0), borderCreaseAngleDeg);
		const ScalarType creaseAngleDeg = internalCreaseAngleDeg < 0 ? borderAngleDeg : internalCreaseAngleDeg;

		// split on creases
		if (creaseAngleDeg > 0)
		{
			CreaseCut<Mesh>(original, vcg::math::ToRad(creaseAngleDeg));
			Allocator<Mesh>::CompactEveryVector(original);
			UpdateTopology<Mesh>::FaceFace(original);
			UpdateFlags<Mesh>::FaceBorderFromFF(original);
			UpdateFlags<Mesh>::VertexBorderFromFaceAdj(original);
		}

		// Mark the non manifold border vertices as visited on the input mesh
		// TODO maybe optimize this
		{
			// extract border mesh
			EdgeMeshType em;
			ThisType::ExtractMeshBorders(original, em);

			// get the border edge mesh and leave the non manifold vertices only
			tri::Allocator<EdgeMeshType>::CompactEveryVector(em);
			vcg::tri::Clean<EdgeMeshType>::SelectNonManifoldVertexOnEdgeMesh(em);
			for (EdgeMeshType::VertexType & v : em.vert)
			{
				if (!v.IsS())
				{
					tri::Allocator<EdgeMeshType>::DeleteVertex(em, v);
				}
			}
			tri::Allocator<EdgeMeshType>::CompactVertexVector(em);


			// clear visited vertices
			tri::UpdateFlags<Mesh>::VertexClearV(original);
			if (em.vn != 0)
			{
				// iterate over the mesh and mark as visited all the matching vertices with the non manifold border
				tri::UpdateBounding<EdgeMeshType>::Box(em);
				EdgeMeshType::BoxType bbox = em.bbox;
				bbox.Offset(bbox.Diag()/1000.0);
				typedef SpatialHashTable<EdgeMeshType::VertexType, EdgeMeshType::ScalarType> HashVertexGrid;
				HashVertexGrid HG;
				HG.Set(em.vert.begin(), em.vert.end(), bbox);

				typedef EdgeMeshType::CoordType Coord;
				EdgeMeshType::ScalarType dist_upper_bound = bbox.Diag()/1000.0;
				for (VertexType & v : original.vert)
				{
					EdgeMeshType::ScalarType dist;
					EdgeMeshType::VertexType * nonManifoldVertex = GetClosestVertex<EdgeMeshType,HashVertexGrid>(em, HG, Coord::Construct(v.cP()), dist_upper_bound, dist);
					if (nonManifoldVertex != NULL && dist == 0)
					{
						v.SetV();
					}
				}
			}

		}
#ifdef DEBUG_VORO
		io::Exporter<Mesh>::Save(original, "creaseSplit.ply", io::Mask::IOM_VERTCOLOR);
#endif

		// One CC
		std::vector<MeshPtr> ccs = splitCC(original);
		if (ccs.empty())
		{
			return RemeshOneCC(original, samplingRadius, borderAngleDeg);
		}

		// Multiple CCs
//		std::cout << "Remeshing " << ccs.size() << " components" << std::endl;
		for (size_t i=0; i<ccs.size(); i++)
		{
//			std::cout << "Remeshing component " << (i+1) << "/" << ccs.size() << std::endl;
			ccs[i] = RemeshOneCC(*ccs[i], samplingRadius, borderAngleDeg, i);
		}

		MeshPtr ret = std::make_shared<Mesh>();
		for (MeshPtr & mesh : ccs)
		{
			Append<Mesh,Mesh>::Mesh(*ret, *mesh);
		}
		Clean<Mesh>::RemoveDuplicateVertex(*ret, true);
		return ret;
	}

protected:

	///
	/// \brief RemeshOneCC the function that remeshes a single connected component mesh preserving its boundary (consistently for eventually adjacent meshes).
	/// \param original the mesh
	/// \param samplingRadius is the sampling radius for remeshing
	/// \param borderCreaseAngleDeg is the angle treshold for preserving corner points on the mesh boundary
	/// \return the remeshed mesh
	///
	static inline MeshPtr RemeshOneCC(Mesh & original, const ScalarType samplingRadius, const ScalarType borderCreaseAngleDeg = 0.0, int idx = 0)
	{
//		double timeBorders = 0;
//		double timePoisson = 0;
//		double timeRelax = 0;
//		double timeSeed = 0;
//		double timeSources = 0;
//		double timeDelaunay = 0;
//		QElapsedTimer timer;
//		timer.start();

		(void)idx;

		RequireCompactness(original);
		RequirePerFaceFlags(original);

		UpdateTopology<Mesh>::FaceFace(original);
		UpdateFlags<Mesh>::FaceBorderFromFF(original);
		UpdateFlags<Mesh>::VertexBorderFromFaceAdj(original);

#ifdef DEBUG_VORO
		io::ExporterPLY<MeshType>::Save(original, QString("cc_%1.ply").arg(idx).toStdString().c_str(), io::Mask::IOM_VERTCOLOR);
#endif

		// Resample border
		Mesh poissonEdgeMesh;
		{
			typedef typename EdgeMeshType::CoordType Coord;

			EdgeMeshType em;
			ThisType::ExtractMeshBorders(original, em);
			Allocator<EdgeMeshType>::CompactVertexVector(em);
			Allocator<EdgeMeshType>::CompactEdgeVector(em);
			// split on non manifold vertices of edgemesh
			vcg::tri::Clean<EdgeMeshType>::SelectNonManifoldVertexOnEdgeMesh(em);
			{
				// select also the visited vertices (coming from the non manifold vertices of the whole crease-cut mesh)
				for (auto & v : em.vert)
				{
					if (v.IsV()) { v.SetS(); }
				}
			}
			const int manifoldSplits = vcg::tri::Clean<EdgeMeshType>::SplitSelectedVertexOnEdgeMesh(em);
			(void)manifoldSplits;

#ifdef DEBUG_VORO
			std::cout << manifoldSplits << " non-manifold splits" << std::endl;
			io::ExporterOBJ<EdgeMeshType>::Save(em, QString("edgeMesh_%1.obj").arg(idx).toStdString().c_str(), io::Mask::IOM_EDGEINDEX);
#endif

			// eventually split on 'creases'
			if (borderCreaseAngleDeg > 0.0)
			{
				// split creases
				UpdateFlags<EdgeMeshType>::VertexClearS(em);
				UpdateFlags<EdgeMeshType>::VertexClearV(em);
				Clean<EdgeMeshType>::SelectCreaseVertexOnEdgeMesh(em, vcg::math::ToRad(borderCreaseAngleDeg));
				const int splits = Clean<EdgeMeshType>::SplitSelectedVertexOnEdgeMesh(em);
				(void)splits;

#ifdef DEBUG_VORO
				std::cout << splits << " splits" << std::endl;
				io::ExporterOBJ<EdgeMeshType>::Save(em, QString("edgeMesh_split_%1.obj").arg(idx).toStdString().c_str(), io::Mask::IOM_EDGEINDEX);
#endif
			}

			// Samples vector
			std::vector<Coord> borderSamples;
			TrivialSampler<EdgeMeshType> ps(borderSamples);

			// uniform edge sampling
			UpdateTopology<EdgeMeshType>::EdgeEdge(em);
			SurfaceSampling<EdgeMeshType>::EdgeMeshUniform(em, ps, samplingRadius, false);
			BuildMeshFromCoordVector(poissonEdgeMesh, borderSamples);
			UpdateBounding<Mesh>::Box(poissonEdgeMesh);

			// remove duplicate vertices
			Clean<Mesh>::RemoveDuplicateVertex(poissonEdgeMesh, false);
			Allocator<Mesh>::CompactVertexVector(poissonEdgeMesh);

			// select all vertices (to mark them fixed)
			UpdateFlags<Mesh>::VertexSetS(poissonEdgeMesh);

#ifdef DEBUG_VORO
			io::ExporterPLY<MeshType>::Save(poissonEdgeMesh, QString("borderMesh_%1.ply").arg(idx).toStdString().c_str(), io::Mask::IOM_VERTCOLOR);
#endif
		}

//		timeBorders = timer.restart() / 1000.0;

		typedef VoronoiProcessing<Mesh>            Voronoi;
		typedef TrivialSampler<Mesh>               BaseSampler;
		typedef SurfaceSampling<Mesh, BaseSampler> SurfaceSampler;
		typedef SurfaceSampling<Mesh, FixSampler>  SurfaceFixSampler;

		// copy original mesh
		Mesh baseMesh;
		Append<Mesh, Mesh>::MeshCopy(baseMesh, original, false, true);

		// refine to obtain a base mesh
		VoronoiProcessingParameter vpp;
		vpp.refinementRatio = 4.0f;
		Voronoi::PreprocessForVoronoi(baseMesh, samplingRadius, vpp);

		// Poisson sampling preserving border
		std::vector<CoordType> seedPointVec;
		std::vector<bool>      seedFixedVec;
		FixSampler fix_sampler(seedPointVec, seedFixedVec);

		// montecarlo sampler
		std::vector<CoordType> sampleVec;
		BaseSampler mps(sampleVec);

		// NOTE in order to make the results consistent the random sampling generator is initialized with the same value
		SurfaceSampler::SamplingRandomGenerator().initialize(5489u);

		// Montecarlo oversampling
		Mesh montecarloMesh;
		int poissonCount = SurfaceSampler::ComputePoissonSampleNum(original, samplingRadius) * 0.7;

//		std::cout << "poisson Count: " << poissonCount << std::endl;
		if (poissonCount <= 0)
		{
			// no need for internal sampling
			for (auto vi = poissonEdgeMesh.vert.begin(); vi != poissonEdgeMesh.vert.end(); vi++)
			{
				fix_sampler.AddVert(*vi);
			}
		}
		else
		{
			// Montecarlo poisson sampling
			SurfaceSampler::MontecarloPoisson(original, mps, poissonCount * 20);
			BuildMeshFromCoordVector(montecarloMesh,sampleVec);

#ifdef DEBUG_VORO
			io::ExporterPLY<MeshType>::Save(montecarloMesh, QString("montecarloMesh_%1.ply").arg(idx).toStdString().c_str());
#endif

			// Poisson disk pruning initialized with edges
			typename SurfaceFixSampler::PoissonDiskParam pp;
			pp.preGenMesh = &poissonEdgeMesh;
			pp.preGenFlag = true;
			SurfaceFixSampler::PoissonDiskPruning(fix_sampler, montecarloMesh, samplingRadius, pp);

		}

#ifdef DEBUG_VORO
			Mesh poissonMesh;
			BuildMeshFromCoordVector(poissonMesh,seedPointVec);
			io::ExporterPLY<MeshType>::Save(poissonMesh, QString("poissonMesh_%1.ply").arg(idx).toStdString().c_str());
#endif

//		timePoisson = timer.restart() / 1000.0;

//		std::cout << "poisson samples " << seedPointVec.size() << std::endl;

		// not enough points
		if (seedPointVec.size() < 3)
		{
			return std::make_shared<Mesh>();
		}

		// restricted relaxation with fixed points
		vpp.seedPerturbationProbability = 0.0f;
		Voronoi::RestrictedVoronoiRelaxing(baseMesh, seedPointVec, seedFixedVec, VoroRelaxationStep, vpp);

#ifdef DEBUG_VORO
		BuildMeshFromCoordVector(poissonMesh,seedPointVec);
		io::ExporterPLY<MeshType>::Save(poissonMesh, QString("relaxedMesh_%1.ply").arg(idx).toStdString().c_str());
#endif

//		timeRelax = timer.restart() / 1000.0;

		// FAIL?
		MeshPtr finalMeshPtr = std::make_shared<Mesh>();
		std::vector<VertexType *> seedVertexVec;
//				Voronoi::SeedToVertexConversion(baseMesh, seedPointVec, seedVertexVec, false);
		ThisType::SeedToFixedBorderVertexConversion(baseMesh, samplingRadius, seedPointVec, seedFixedVec, seedVertexVec);
		EuclideanDistance<Mesh> dd;
//		timeSeed = timer.restart() / 1000.0;

//		std::cout << "BEGIN compute vertex sources (basemesh vn:" << baseMesh.VN() << " fn:" << baseMesh.FN() << ")" << std::endl;
		Voronoi::ComputePerVertexSources(baseMesh, seedVertexVec, dd);
//		std::cout << "END   compute vertex sources" << std::endl;
//		timeSources = timer.restart() / 1000.0;
		// traditional
//		Voronoi::ConvertDelaunayTriangulationToMesh(baseMesh, *finalMeshPtr, seedVertexVec, false);
		// border-preserving
		ThisType::ConvertDelaunayTriangulationExtendedToMesh(baseMesh, *finalMeshPtr, seedVertexVec);

#ifdef DEBUG_VORO
		io::ExporterPLY<MeshType>::Save(*finalMeshPtr, QString("voroMesh_%1.ply").arg(idx).toStdString().c_str());
		io::ExporterPLY<MeshType>::Save(baseMesh, QString("baseMesh_%1.ply").arg(idx).toStdString().c_str(), io::Mask::IOM_VERTCOLOR);
#endif

//		timeDelaunay = timer.elapsed() / 1000.0;

//		std::cout << "border:   " << timeBorders  << std::endl
//		          << "poisson:  " << timePoisson  << std::endl
//		          << "relax:    " << timeRelax    << std::endl
//		          << "seed:     " << timeSeed     << std::endl
//		          << "sources:  " << timeSources  << std::endl
//		          << "delaunay: " << timeDelaunay << std::endl;

		return finalMeshPtr;
	}

	static inline void ExtractMeshBorders(Mesh & mesh, EdgeMeshType & sides)
	{
		RequireFFAdjacency(mesh);

		// clean the edge mesh containing the borders
		sides.Clear();

		// gather into separate vertices lists
		std::vector<std::vector<VertexType *> > edges;

		for (auto fi = mesh.face.begin(); fi != mesh.face.end(); fi++)
		{
			for (int e=0; e<fi->VN(); e++)
			{
				if (vcg::face::IsBorder(*fi, e))
				{
					std::vector<VertexType *> tmp;
					tmp.push_back(fi->V(e));
					tmp.push_back(fi->V((e+1)%fi->VN()));
					edges.push_back(tmp);
				}
			}
		}

		// convert to edge mesh
		for (auto & e : edges)
		{
			assert(e.size() >= 2);

			std::vector<typename EdgeMeshType::VertexType *> newVtx;

			// insert new vertices and store their pointer
			auto vi = Allocator<EdgeMeshType>::AddVertices(sides, e.size());
			for (const auto & v : e)
			{
				vi->ImportData(*v);
				newVtx.push_back(&(*vi++));
			}

			auto ei = Allocator<EdgeMeshType>::AddEdges(sides, e.size() - 1);
			for (int i=0; i<static_cast<int>(e.size() - 1); i++)
			{
				ei->V(0) = newVtx[i];
				ei->V(1) = newVtx[i+1];
				ei++;
			}
		}

		Clean<EdgeMeshType>::RemoveDuplicateVertex(sides);
	}

	static void SeedToFixedBorderVertexConversion(MeshType & m,
	                                              const ScalarType samplingRadius,
	                                              const std::vector<CoordType> & seedPVec,
	                                              const std::vector<bool> & seedFixed,
	                                              std::vector<VertexType *> & seedVVec)
	{
		typedef typename vcg::SpatialHashTable<VertexType, ScalarType> HashVertexGrid;
		seedVVec.clear();

		UpdateTopology<MeshType>::FaceFace(m);
		UpdateFlags<MeshType>::VertexBorderFromFaceAdj(m);

		typename MeshType::BoxType bbox = m.bbox;
		bbox.Offset(bbox.Diag()/100.0);

		// internal vertices grid
		HashVertexGrid HG;
		HG.Set(m.vert.begin(),m.vert.end(), bbox);

		// boundary vertices grid
		MeshType borderMesh;
		HashVertexGrid borderHG;
		{
			// get border vertices and build another mesh
			std::vector<CoordType> borderPts;
			for (auto vit=m.vert.begin(); vit!=m.vert.end(); vit++)
			{
				if (!vit->IsD() && vit->IsB())
					borderPts.push_back(vit->cP());
			}
			if (!borderPts.empty())
			{
				BuildMeshFromCoordVector(borderMesh,borderPts);
				borderMesh.bbox = m.bbox;
				borderHG.Set(borderMesh.vert.begin(), borderMesh.vert.end(), bbox);
			}
		}

		const ScalarType dist_upper_bound=samplingRadius*4;
		VertexType * vp = NULL;

		for( size_t i = 0; i < seedPVec.size(); i++)
		{
			const CoordType & p = seedPVec[i];
			const bool fixed    = seedFixed[i];
			if (!fixed)
			{
				ScalarType dist;
				vp = GetClosestVertex<MeshType,HashVertexGrid>(m, HG, p, dist_upper_bound, dist);
				if (vp)
				{
					seedVVec.push_back(vp);
				}
			}
			else
			{
				vp = NULL;

				ScalarType dist;
				VertexType * borderVp = GetClosestVertex<MeshType,HashVertexGrid>(borderMesh, borderHG, p, dist_upper_bound, dist);

				if (borderVp)
				{
					std::vector<ScalarType>   dist;
					std::vector<VertexType *> vps;
					std::vector<CoordType>    pts;

					//			vp = GetClosestVertex<MeshType,HashVertexGrid>(m, HG, borderVp->cP(), dist_upper_bound, dist);
					unsigned int n = GetKClosestVertex<MeshType,HashVertexGrid>(m, HG, 16, borderVp->cP(), dist_upper_bound, vps, dist, pts);
					if (n>0)
					{
						ScalarType d = dist[0];
						seedVVec.push_back(vps[0]);
						assert(dist.size() == size_t(n));
						for (size_t j=1; j<dist.size(); j++)
						{
							if (dist[j] <= d)
							{
								seedVVec.push_back(vps[j]);
								d = dist[j];
							}
							else
							{
								break;
							}
						}
					}
				}
			}
		}
	}
  
	static void ConvertDelaunayTriangulationExtendedToMesh(MeshType &m,
	                                                       MeshType &outMesh,
	                                                       std::vector<VertexType *> &seedVec)
	{
		typedef VoronoiProcessing<MeshType> Voronoi;

		RequirePerVertexAttribute(m ,"sources");
		RequireCompactness(m);
		RequireVFAdjacency(m);

		auto sources = Allocator<MeshType>::template GetPerVertexAttribute<VertexPointer> (m,"sources");

		outMesh.Clear();
		UpdateTopology<MeshType>::FaceFace(m);
		UpdateFlags<MeshType>::FaceBorderFromFF(m);

		std::map<VertexPointer, int> seedMap;  // It says if a given vertex of m is a seed (and its index in seedVec)
		Voronoi::BuildSeedMap(m, seedVec, seedMap);

		std::vector<FacePointer> innerCornerVec,   // Faces adjacent to three different regions
		        borderCornerVec;  // Faces that are on the border and adjacent to at least two regions.
		Voronoi::GetFaceCornerVec(m, sources, innerCornerVec, borderCornerVec);

		// First add all the needed vertices: seeds and corners

		for(size_t i=0;i<seedVec.size();++i)
		{
			Allocator<MeshType>::AddVertex(outMesh, seedVec[i]->P(), vcg::Color4b::White);
		}

		// Now just add one face for each inner corner
		std::vector<std::array<VertexPointer, 3> > toAdd;
		for(size_t i=0; i<innerCornerVec.size(); ++i)
		{
			VertexPointer s0 = sources[innerCornerVec[i]->V(0)];
			VertexPointer s1 = sources[innerCornerVec[i]->V(1)];
			VertexPointer s2 = sources[innerCornerVec[i]->V(2)];
			assert ( (s0!=s1) && (s0!=s2) && (s1!=s2) );
			VertexPointer v0 = & outMesh.vert[seedMap[s0]];
			VertexPointer v1 = & outMesh.vert[seedMap[s1]];
			VertexPointer v2 = & outMesh.vert[seedMap[s2]];
			Allocator<MeshType>::AddFace(outMesh, v0, v1, v2);
		}

		// Now loop around the borders and find the missing delaunay triangles
		// select border seed vertices only and pick one
		UpdateFlags<Mesh>::VertexBorderFromFaceAdj(m);
		UpdateFlags<Mesh>::VertexClearS(m);
		UpdateFlags<Mesh>::VertexClearV(m);

		std::vector<VertexPointer> borderSeeds;
		for (auto & s : seedVec)
		{
			if (s->IsB())
			{
				s->SetS();
				borderSeeds.emplace_back(s);
			}
		}

		for (VertexPointer startBorderVertex : borderSeeds)
		{
			if (startBorderVertex->IsV())
			{
				continue;
			}

			// unvisited border seed found

			// put the pos on the border
			PosType pos(startBorderVertex->VFp(), startBorderVertex->VFi());
			do {
				pos.NextE();
			} while (!pos.IsBorder() || (pos.VInd() != pos.E()));

			// check all border edges between each consecutive border seeds pair
			do {
				std::vector<VertexPointer> edgeVoroVertices(1, sources[pos.V()]);
				//	among all sources found
				do {
					pos.NextB();
					VertexPointer source = sources[pos.V()];
					if (edgeVoroVertices.empty() || edgeVoroVertices.back() != source)
					{
						edgeVoroVertices.push_back(source);
					}
				} while (!pos.V()->IsS());

				pos.V()->SetV();

//				assert(edgeVoroVertices.size() >= 2);


				if (edgeVoroVertices.size() >= 3)
				{
					std::vector<VertexPointer> v;
					for (size_t i=0; i<edgeVoroVertices.size(); i++)
					{
						v.push_back(&outMesh.vert[seedMap[edgeVoroVertices[i]]]);
					}
					// also handles N>3 vertices holes
					for (size_t i=0; i<edgeVoroVertices.size()-2; i++)
					{
						Allocator<MeshType>::AddFace(outMesh, v[0],v[i+1],v[i+2]);
					}
//					if (edgeVoroVertices.size() > 3)
//					{
//						std::cout << "Weird case: " << edgeVoroVertices.size() << " voroseeds on one border" << std::endl;
//					}
				}
//				// add face if 3 different voronoi regions are crossed by the edge
//				if (edgeVoroVertices.size() == 3)
//				{
//					VertexPointer v0 = & outMesh.vert[seedMap[edgeVoroVertices[0]]];
//					VertexPointer v1 = & outMesh.vert[seedMap[edgeVoroVertices[1]]];
//					VertexPointer v2 = & outMesh.vert[seedMap[edgeVoroVertices[2]]];
//					Allocator<MeshType>::AddFace(outMesh, v0,v1,v2);
//				}
//				else
//				{
//					std::cout << "Weird case!! " << edgeVoroVertices.size() << " voroseeds on one border" << std::endl;
//					if (edgeVoroVertices.size() == 4)
//					{
//						VertexPointer v0 = & outMesh.vert[seedMap[edgeVoroVertices[0]]];
//						VertexPointer v1 = & outMesh.vert[seedMap[edgeVoroVertices[1]]];
//						VertexPointer v2 = & outMesh.vert[seedMap[edgeVoroVertices[2]]];
//						VertexPointer v3 = & outMesh.vert[seedMap[edgeVoroVertices[3]]];
//						Allocator<MeshType>::AddFace(outMesh, v0,v1,v2);
//						Allocator<MeshType>::AddFace(outMesh, v0,v2,v3);
//					}
//				}

			} while ((pos.V() != startBorderVertex));
		}


		Clean<MeshType>::RemoveUnreferencedVertex(outMesh);
		Allocator<MeshType>::CompactVertexVector(outMesh);
	}

	///
	/// \brief The FixSampler class is used with poisson disk pruning to preserve selected vertices and
	/// keep an auxiliary vector indicating wether the sample is fixed or not
	///
	class FixSampler
	{
	public:
		typedef typename MeshType::CoordType  CoordType;
		typedef typename MeshType::VertexType VertexType;

		FixSampler(std::vector<CoordType> & samples, std::vector<bool> & fixed)
		    : sampleVec(samples)
		    , fixedVec (fixed)
		{
			reset();
		}

		void reset()
		{
			sampleVec.clear();
			fixedVec .clear();
		}

		void AddVert(const VertexType &p)
		{
			sampleVec.push_back(p.cP());
			fixedVec .push_back(p.IsS());
		}

	private:
		std::vector<CoordType> & sampleVec;
		std::vector<bool>      & fixedVec;
	};

};
} // end namespace tri
} // end namespace vcg

#endif // _VCGLIB_VORONOI_REMESHER_H
