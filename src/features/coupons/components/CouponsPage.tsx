import { useState } from 'react';
import { Layout, Typography, Button, Input, Empty, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCouponsData, useDeleteCoupon } from '../hooks/useCouponsData';
import CouponsTable from './CouponList/CouponsTable';
import CouponModal from './CouponForm/CouponModal';
import { Coupon } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

const { Content } = Layout;
const { Title } = Typography;

export const CouponsPage = () => {
    const { t, isRTL } = useLanguage();
    const [messageApi, contextHolder] = message.useMessage();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    const { data, isLoading } = useCouponsData({
        page,
        per_page: 20,
        search: debouncedSearch
    });

    const deleteMutation = useDeleteCoupon();

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm(t('deleteCouponConfirm') || 'Are you sure you want to delete this coupon?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    messageApi.success(t('couponDeleted') || 'Coupon deleted successfully');
                },
                onError: (error: any) => {
                    messageApi.error(error.message || t('errorDeletingCoupon') || 'Failed to delete coupon');
                }
            });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCoupon(null);
    };

    return (
        <Content style={{ padding: '16px', minHeight: 280, direction: isRTL ? 'rtl' : 'ltr' }}>
            {contextHolder}
            <div style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
            }}>
                <Title level={2} style={{ margin: 0 }}>
                    {t('coupons') || 'Coupons'}
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setSelectedCoupon(null);
                        setIsModalOpen(true);
                    }}
                >
                    {t('addCoupon') || 'Add Coupon'}
                </Button>
            </div>

            <Input
                placeholder={t('searchCoupons') || 'Search coupons...'}
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 24, width: '100%', maxWidth: 400 }}
                allowClear
            />

            {!isLoading && (!data?.data || data.data.length === 0) ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('noCoupons') || 'No coupons found'}
                >
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>
                        {t('createFirstCoupon') || 'Create your first coupon'}
                    </Button>
                </Empty>
            ) : (
                <CouponsTable
                    coupons={data?.data || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        current: page,
                        pageSize: 20,
                        total: data?.total || 0,
                        onChange: (p: number) => setPage(p),
                        showSizeChanger: false
                    }}
                />
            )}

            {isModalOpen && (
                <CouponModal
                    open={isModalOpen}
                    onClose={handleModalClose}
                    coupon={selectedCoupon}
                    messageApi={messageApi}
                />
            )}
        </Content>
    );
};

export default CouponsPage;
