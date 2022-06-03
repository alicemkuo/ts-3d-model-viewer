import * as c3d from '../kernel/kernel';
import { GConstructor } from "../util/Util";
import { Agent, ControlPointData, DatabaseLike, MaterialOverride, TemporaryObject, TopologyData } from "./DatabaseLike";
import * as visual from "../visual_model/VisualModel";

export class DatabaseProxy implements DatabaseLike {
    constructor(protected readonly db: DatabaseLike) { }

    get version() { return this.db.version }

    async addItem(model: c3d.Solid, agent?: Agent): Promise<visual.Solid>;
    async addItem(model: c3d.SpaceInstance, agent?: Agent): Promise<visual.SpaceInstance<visual.Curve3D>>;
    async addItem(model: c3d.PlaneInstance, agent?: Agent): Promise<visual.PlaneInstance<visual.Region>>;
    async addItem(model: c3d.Item, agent: Agent = 'user'): Promise<visual.Item> {
        return this.db.addItem(model, agent);
    }

    async replaceItem(from: visual.Solid, model: c3d.Solid, agent?: Agent): Promise<visual.Solid>;
    async replaceItem<T extends visual.SpaceItem>(from: visual.SpaceInstance<T>, model: c3d.SpaceInstance, agent?: Agent): Promise<visual.SpaceInstance<visual.Curve3D>>;
    async replaceItem<T extends visual.PlaneItem>(from: visual.PlaneInstance<T>, model: c3d.PlaneInstance, agent?: Agent): Promise<visual.PlaneInstance<visual.Region>>;
    async replaceItem(from: visual.Item, model: c3d.Item, agent?: Agent): Promise<visual.Item>;
    async replaceItem(from: visual.Item, to: c3d.Item): Promise<visual.Item> {
        return this.db.replaceItem(from, to);
    }

    async removeItem(view: visual.Item, agent?: Agent): Promise<void> {
        return this.db.removeItem(view, agent);
    }

    async duplicate(model: visual.Solid): Promise<visual.Solid>;
    async duplicate<T extends visual.SpaceItem>(model: visual.SpaceInstance<T>): Promise<visual.SpaceInstance<T>>;
    async duplicate<T extends visual.PlaneItem>(model: visual.PlaneInstance<T>): Promise<visual.PlaneInstance<T>>;
    async duplicate(edge: visual.CurveEdge): Promise<visual.SpaceInstance<visual.Curve3D>>;
    async duplicate(item: visual.Item | visual.CurveEdge): Promise<visual.Item> {
        // @ts-expect-error('typescript cant type polymorphism like this')
        return this.db.duplicate(item);
    }

    addPhantom(object: c3d.Item, materials?: MaterialOverride): Promise<TemporaryObject> {
        return this.db.addPhantom(object, materials);
    }

    addTemporaryItem(object: c3d.Item): Promise<TemporaryObject> {
        return this.db.addTemporaryItem(object);
    }

    replaceWithTemporaryItem(from: visual.Item, to: c3d.Item): Promise<TemporaryObject> {
        return this.db.replaceWithTemporaryItem(from, to);
    }

    optimization<T>(from: visual.Item, fast: () => T, ifDisallowed: () => T): T {
        return this.db.optimization(from, fast, ifDisallowed);
    }

    clearTemporaryObjects() {
        this.db.clearTemporaryObjects();
    }

    get temporaryObjects() { return this.db.temporaryObjects }
    get phantomObjects() { return this.db.phantomObjects }

    lookup(object: visual.Solid): c3d.Solid;
    lookup(object: visual.SpaceInstance<visual.Curve3D>): c3d.SpaceInstance;
    lookup(object: visual.PlaneInstance<visual.Region>): c3d.PlaneInstance;
    lookup(object: visual.Item): c3d.Item;
    lookup(object: visual.Item): c3d.Item {
        return this.db.lookup(object);
    }

    lookupItemById(id: c3d.SimpleName): { view: visual.Item, model: c3d.Item } {
        if (id === undefined) console.trace();
        return this.db.lookupItemById(id);
    }

    hasTopologyItem(id: string): boolean {
        return this.db.hasTopologyItem(id);
    }

    lookupTopologyItemById(id: string): TopologyData {
        return this.db.lookupTopologyItemById(id);
    }

    lookupTopologyItem(object: visual.Face): c3d.Face;
    lookupTopologyItem(object: visual.CurveEdge): c3d.CurveEdge;
    lookupTopologyItem(object: visual.Edge | visual.Face): c3d.TopologyItem {
        // @ts-expect-error('typescript cant type polymorphism like this')
        return this.db.lookupTopologyItem(object);
    }

    lookupControlPointById(id: string): ControlPointData {
        return this.db.lookupControlPointById(id);
    }

    find<T extends visual.PlaneInstance<visual.Region>>(klass: GConstructor<T>, includeAutomatics?: boolean): { view: T, model: c3d.PlaneInstance }[];
    find<T extends visual.SpaceInstance<visual.Curve3D>>(klass: GConstructor<T>, includeAutomatics?: boolean): { view: T, model: c3d.SpaceInstance }[];
    find<T extends visual.Solid>(klass: GConstructor<T>, includeAutomatics?: boolean): { view: T, model: c3d.Solid }[];
    find<T extends visual.Item>(klass?: GConstructor<T>, includeAutomatics?: boolean): { view: T, model: c3d.Item }[] {
        // @ts-expect-error('typescript cant type polymorphism like this')
        return this.db.find(klass, includeAutomatics);
    }

    findAll(includeAutomatics?: boolean): { view: visual.Item, model: c3d.Solid }[] {
        return this.db.findAll(includeAutomatics);
    }

    pool(solid: c3d.Solid, size: number) {
        return this.db.pool(solid, size);
    }

    lookupId(version: c3d.SimpleName): number | undefined {
        return this.db.lookupId(version);
    }
    
    lookupById(name: c3d.SimpleName): { view: visual.Item; model: c3d.Item; } {
        return this.db.lookupById(name);
    }

    async deserialize(data: Buffer): Promise<visual.Item[]> { return this.db.deserialize(data) }
    async load(model: c3d.Model | c3d.Assembly): Promise<visual.Item[]> { return this.db.load(model) }
}
