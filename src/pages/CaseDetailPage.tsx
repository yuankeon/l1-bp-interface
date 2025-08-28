import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Upload, Button, message, Modal, type UploadFile, Space } from 'antd';
import { UploadOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCaseDetail, uploadCaseFile } from '../api';
import { formatSize } from '../utils/utils';
import { usePagination } from '../hooks/usePagination';
import { getFileStatusText } from '../utils/const';

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
      render: (val: number) => getFileStatusText(val)
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
      <Card style={{ marginBottom: 16 }} title="L1 BP 材料撰写">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
          {/* 左侧：必需文件说明 */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
              请先上传以下必需文件（原始材料）：
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#1890ff', marginBottom: 0, lineHeight: 1.8 }}>
              01 L1_original_information.txt<br />
              02 L1_core_narrative_info.txt<br />
              04 L1_market_research.txt
            </div>
            <div style={{ marginTop: 'auto' }}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={openModal}
              >
                上传文件
              </Button>
            </div>
          </div>
          {/* 右侧：生成材料提示和按钮 */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 15, color: '#fa8c16', marginBottom: 12, fontWeight: 500 }}>
              在确认无误之后，点击启动按钮，将自动生成以下撰写材料：
            </div>
            <div style={{
              fontSize: 16,
              color: '#222',
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 8,
              padding: '12px',
              margin: '0 0 18px 0',
              maxWidth: 400,
              lineHeight: 2,
              width: '100%'
            }}>
              <div>- 05 L1_services_and_pricing</div>
              <div>- 06 L1_personnel_plan</div>
              <div>- 07 L1_operation_expenses</div>
              <div>- 08 L1_sales_forecast</div>
              <div>- 09 L1_personnel_and_financial</div>
            </div>
            <Space>
              <Button
                type="primary"
                onClick={handleStart}
              >
                启动 L1 BP 材料撰写
              </Button>
              <Button>
                查看结果
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* 文件信息区 */}
      <Card
        title="文件信息"
        extra={
          <div style={{ display: 'flex', gap: 10 }}>
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