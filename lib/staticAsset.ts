import { STATIC_ASSETS_ORIGIN } from '@/lib/config'
import { aipochStaticAssets, type StaticAssetGroup } from '@/lib/static-assets'

const trimEdgeSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '')

const findAssetGroup = (fileName: string): StaticAssetGroup | undefined =>
  aipochStaticAssets.find((group) => group.children.some((asset) => asset.fileName === fileName))

export function staticAsset(fileName: string): string {
  const assetName = trimEdgeSlashes(fileName)
  const group = findAssetGroup(assetName)
  if (!group) return ''

  const domain = STATIC_ASSETS_ORIGIN.replace(/\/+$/, '')
  const prefix = trimEdgeSlashes(group.prefix)
  return `${domain}/${prefix}/${assetName}`
}

// Next Image callers can read intrinsic sizes without maintaining a separate asset catalogue.
export const staticImage = (fileName: string): { src: string; width: number; height: number } => {
  const assetName = trimEdgeSlashes(fileName)
  const asset = findAssetGroup(assetName)?.children.find((item) => item.fileName === assetName)
  if (asset?.width === undefined || asset.height === undefined) {
    throw new Error(`Image dimensions are not registered for static asset: ${assetName}`)
  }
  return { src: staticAsset(assetName), width: asset.width, height: asset.height }
}
