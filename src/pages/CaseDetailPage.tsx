import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Upload, Button, message, Modal, type UploadFile } from 'antd';
import { UploadOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCaseDetail, uploadCaseFile } from '../api';
import { formatSize } from '../utils/utils';
import { usePagination } from '../hooks/usePagination';

interface FileItem {
  id: number;
  name: string;
  url: string;
  create_date: number;
  size: number;
  status: number;
  content: string;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const { pagination, pagedData, setPagination } = usePagination(files);

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

  const handleStart = async () => {
    // TODO: 调用生成 L1 BP 材料的接口
    message.success('L1 BP 材料生成已启动！');
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (val: number) => val === 1 ? '已处理' : '处理中'
    },
    {
      title: '上传时间',
      dataIndex: 'create_date',
      key: 'create_date',
      width: 300,
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 200,
      render: (val: number) => formatSize(val)
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: FileItem) => (
        <Button
          size="small"
          onClick={() => {
            setPreviewContent(record.content || '无内容');
            setPreviewVisible(true);
          }}
        >
          查看
        </Button>
      )
    }
  ];

  return (
    <div className="page-container">
      {/* 启动区美观卡片 */}
      <Card
        style={{
          margin: '0 auto 40px auto',
          maxWidth: 520,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
          borderRadius: 18,
          border: 'none',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f0f5ff 0%, #e6fffb 100%)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#222' }}>
          L1 BP 材料撰写启动区
        </div>
        <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
          请先上传以下必需文件（原始材料）：
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, color: '#1890ff', marginBottom: 24, lineHeight: 1.8 }}>
          01 L1_original_information.txt<br />
          02 L1_core_narrative_info.txt<br />
          04 L1_market_research.txt
        </div>
        <Button
          type="primary"
          style={{
            width: 240,
            height: 48,
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 24,
            background: 'linear-gradient(90deg, #52c41a 0%, #1890ff 100%)',
            border: 'none',
            boxShadow: '0 2px 8px 0 rgba(24,144,255,0.10)'
          }}
          onClick={handleStart}
        >
          启动 L1 BP 材料撰写
        </Button>
      </Card>

      {/* 文件信息区 */}
      <Card
        title={<span style={{ fontWeight: 600, fontSize: 18 }}>文件信息</span>}
        extra={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="primary" icon={<UploadOutlined />} onClick={openModal}>上传文件</Button>
            <Button icon={<ReloadOutlined />} onClick={() => {
              if (id) {
                fetchFiles(id);
              }
            }}>刷新</Button>
          </div>
        }
      >
        <Modal
          open={previewVisible}
          title="内容预览"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={1000}
        >
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '80vh', overflow: 'auto' }}>
            {previewContent}
          </pre>
        </Modal>
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
          dataSource={pagedData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: files.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条文件`,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize,
              });
            },
          }}
        />
      </Card>
    </div>
  );
};

export default CaseDetailPage;