import { L1FileStatus } from "../utils/const"
import { Tag } from "antd"

export const getTagText = (status: L1FileStatus) => {
  if (status < 0) {
    return <Tag color="red">处理失败</Tag>
  }
  if (status === L1FileStatus.ReadSuccess || status === L1FileStatus.RecognitionSuccess) {
    return <Tag color="success">识别成功</Tag>
  }
  return <Tag color="processing">处理中</Tag>
}