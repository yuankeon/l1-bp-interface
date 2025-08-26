import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getCaseDetail, uploadCaseFile } from '../api';

interface FileItem {
  id: number;
  name: string;
  url: string;
  upload_time: number;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (info: any) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('lawcase_id', id as string);
      formData.append('files', info.file);
      await uploadCaseFile(formData);
      message.success('上传成功');
      fetchFiles(id as string);
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
      render: (text: string, record: FileItem) => (
        <a href={record.url} target="_blank" rel="noopener noreferrer">{text}</a>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'upload_time',
      key: 'upload_time',
      render: (val: number) => new Date(val * 1000).toLocaleString()
    }
  ];

  return (
    <div className="page-container">
      <Card title={`文件信息`}>
        <Upload
          customRequest={({ file, onSuccess, onError }) => {
            handleUpload({ file })
              .then(() => onSuccess && onSuccess({}, file))
              .catch(onError);
          }}
          showUploadList={false}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading} type="primary" style={{ marginBottom: 16 }}>
            上传文件
          </Button>
        </Upload>
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