import { checkFileTypeIsImage } from '@/background/utils/uplpadFileProcessHelper'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useDocUploadAndTextExtraction from '@/features/chatgpt/hooks/upload/useDocUploadAndTextExtraction'
import useUploadImagesAndSwitchToMaxAIVisionModel from '@/features/chatgpt/hooks/upload/useUploadImagesAndSwitchToMaxAIVisionModel'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'

const useMaxAIModelUploadFile = () => {
  const { uploadImagesAndSwitchToMaxAIVisionModel } =
    useUploadImagesAndSwitchToMaxAIVisionModel()
  const { uploadDocAndTextExtraction } = useDocUploadAndTextExtraction()
  const { getCanUploadFiles } = useAIProviderUpload()
  const isContainMaxAIModelUploadFile = (uploadFiles: File[]) => {
    return (
      uploadFiles &&
      uploadFiles.filter(
        (uploadFile) =>
          checkFileTypeIsImage(uploadFile) ||
          FileExtractor.canExtractTextFromFileName(uploadFile.name),
      ).length > 0
    )
  }
  const uploadFilesToMaxAIModel = async (uploadFiles: File[]) => {
    const uploadImages: File[] = []
    const uploadDocs: File[] = []
    const canUploadFiles = await getCanUploadFiles(uploadFiles)
    if (!canUploadFiles || canUploadFiles.length === 0) {
      return
    }
    canUploadFiles.forEach((uploadFile) => {
      if (checkFileTypeIsImage(uploadFile)) {
        uploadImages.push(uploadFile)
      } else if (FileExtractor.canExtractTextFromFileName(uploadFile.name)) {
        uploadDocs.push(uploadFile)
      }
    })
    await uploadImagesAndSwitchToMaxAIVisionModel(uploadImages)
    await uploadDocAndTextExtraction(uploadDocs)
  }
  return {
    isContainMaxAIModelUploadFile,
    uploadFilesToMaxAIModel,
  }
}
export default useMaxAIModelUploadFile
