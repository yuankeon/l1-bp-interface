// L1 BP 文件状态码配置
export enum L1FileStatus {
  Uploaded = 0, // 刚上传
  ReadSuccess = 1, // 代码读取成功
  NeedRecognition = 2, // 需要文件识别
  UploadSuccess = 3, // 文件上传成功（dify）
  RecognitionSuccess = 4, // 文件识别成功（dify）
  ReadFail = -1, // 代码读取失败
  UploadFail = -3, // 文件上传失败
  RecognitionFail = -4, // 文件识别失败
}