import { arrayBufferToFile, blobToFile, newUri } from '@m-fe/utils';

import {
  D3ModelCompressType,
  D3ModelSrc,
  D3ModelType,
  IModelViewerProps,
} from '../types/IModelViewerProps';
import { IModelViewerState } from '../types/IModelViewerState';
import { inflate, unzip } from './compressor';

/** 根据模型名称推导出可能的类型 */
export function getModelType(fileName: string, model: D3ModelSrc): D3ModelType {
  const name: string =
    (model instanceof File ? model.name : model) || fileName || '';

  // FIXME:模型类型不在下列判断时，都会返回 stl, loadMesh 可能出现异常行为
  if (name.indexOf('.stl') > -1) {
    return 'stl';
  } else if (name.indexOf('.glb') > -1) {
    return 'glb';
  } else if (name.indexOf('.obj') > -1) {
    return 'obj';
  } else if (name.indexOf('.ply') > -1) {
    return 'ply';
  } else if (name.indexOf('.3dxml') > -1) {
    return '3dxml';
  } else if (name.indexOf('.catpart') > -1) {
    return 'catpart';
  } else if (name.indexOf('.x_t') > -1) {
    return 'x_t';
  } else if (name.indexOf('.x_b') > -1) {
    return 'x_b';
  }

  return 'stl';
}

/** 根据模型名称推导出可能的压缩类型 */
export function getModelCompressType(
  fileName: string,
  model: D3ModelSrc,
): D3ModelCompressType {
  const name: string =
    (model instanceof File ? model.name : model) || fileName || '';

  if ((name || '').indexOf('.zlib') > -1) {
    return 'zlib';
  }

  if ((name || '').indexOf('.zip') > -1) {
    return 'zip';
  }

  return 'none';
}

/** 将模型统一转化为文件对象 */
export async function getFileObjFromModelSrc(
  props: Partial<IModelViewerProps>,
  state?: Partial<IModelViewerState>,
): Promise<File> {
  // 判断是否为 ZIP 文件
  if (props.compressType !== 'none') {
    let zippedFile;

    if (props.src instanceof File) {
      zippedFile = props.src;
    } else {
      // 将 Blob 转化为文件
      const blob = await (
        await fetch(props.src as string, {
          cache: 'force-cache',
        })
      ).blob();

      zippedFile = blobToFile(blob);
    }

    // 解压缩文件
    let modelArray: Uint8Array;
    if (props.compressType === 'zlib') {
      modelArray = await inflate(zippedFile);
    }

    if (props.compressType === 'zip') {
      modelArray = await unzip(zippedFile);
    }

    return arrayBufferToFile(
      modelArray.buffer,
      'application/stl',
      props.fileName,
    );
  } else {
    // 否则作为正常处理
    if (props.src instanceof File) {
      return props.src;
    } else {
      try {
        // 将 Blob 转化为文件
        const blob = await (
          await fetch(props.src as string, {
            cache: 'force-cache',
          })
        ).blob();

        return blobToFile(blob, newUri(props.src).filename());
      } catch (e) {
        return null;
      }
    }
  }
}
