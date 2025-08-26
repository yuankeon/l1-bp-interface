import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Upload, Button, message, Modal, type UploadFile } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { getCaseDetail, uploadCaseFile } from '../api';
import { formatSize } from '../utils/utils';

interface FileItem {
  id: number;
  name: string;
  url: string;
  create_date: number;
  size: number;
  status: number;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchFiles = async (id: string) => {
    setLoading(true);
    try {
      const res = await getCaseDetail(id);
      setFiles(res.data.list);
    } catch (error) {
      message.error('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFiles(id);
    }
  }, [id]);

  // 打开弹窗
  const openModal = () => setModalVisible(true);
  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
    setFileList([]);
  };
  // 受控 fileList
  const handleChange = ({ fileList }: any) => setFileList(fileList);
  // 阻止自动上传
  const beforeUpload = (file: UploadFile) => {
    setFileList(prev => [...prev, file]);
    return false;
  };
  // 批量上传
  const handleBatchUpload = async () => {
    if (!fileList.length) {
      message.warning('请先选择文件');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('lawcase_id', id as string);
      fileList.forEach((file: UploadFile) => {
        formData.append('files', file.originFileObj as File);
      });
      await uploadCaseFile(formData);
      message.success('上传成功');
      fetchFiles(id as string);
      closeModal();
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      ellipsis: true,
      render: (text: string, record: FileItem) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (val: number) => val === 1 ? '已处理' : '处理中'
    },
    {
      title: '上传时间',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      render: (val: number) => formatSize(val)
    }
  ];

  return (
    <div className="page-container">
      <Card title={`文件信息`} extra={<Button type="primary" icon={<UploadOutlined />} onClick={openModal}>上传文件</Button>}>
        <Modal
          title="批量上传文件"
          open={modalVisible}
          onCancel={closeModal}
          destroyOnHidden
          footer={[
            <Button key="cancel" onClick={closeModal}>取消</Button>,
            <Button key="upload" type="primary" loading={uploading} onClick={handleBatchUpload}>上传</Button>
          ]}
        >
          <Upload.Dragger
            multiple
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            onRemove={file => {
              setFileList(prev => prev.filter(f => f.uid !== file.uid));
            }}
            showUploadList
            style={{ minHeight: 180 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持批量选择或拖拽上传，上传前可删除文件</p>
          </Upload.Dragger>
        </Modal>
        <Table
          columns={columns}
          dataSource={files}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default CaseDetailPage;