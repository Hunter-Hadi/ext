import { checkFileTypeIsImage } from '@/background/utils/uplpadFileProcessHelper'
import useDocUploadAndTextExtraction from '@/features/chatgpt/hooks/upload/useDocUploadAndTextExtraction'
import useUploadImagesAndSwitchToMaxAIVisionModel from '@/features/chatgpt/hooks/upload/useUploadImagesAndSwitchToMaxAIVisionModel'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'

const useMaxAIModelUploadFile = () => {
  const { uploadImagesAndSwitchToMaxAIVisionModel } =
    useUploadImagesAndSwitchToMaxAIVisionModel()
  const { uploadDocAndTextExtraction } = useDocUploadAndTextExtraction()
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
    if (!uploadFiles || uploadFiles.length === 0) {
      return
    }
    uploadFiles.forEach((uploadFile) => {
      if (checkFileTypeIsImage(uploadFile)) {
        uploadImages.push(uploadFile)
      } else if (FileExtractor.canExtractTextFromFileName(uploadFile.name)) {
        uploadDocs.push(uploadFile)
      }
    })
    await uploadDocAndTextExtraction(uploadDocs)
    await uploadImagesAndSwitchToMaxAIVisionModel(uploadImages)
  }
  return {
    isContainMaxAIModelUploadFile,
    uploadFilesToMaxAIModel,
  }
}
export default useMaxAIModelUploadFile
