import { useState } from 'react';
import { Layout, Input, List, Row, Col, Pagination, Typography, Spin, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomersData } from '../hooks/useCustomersData';
import { CustomerCard } from './CustomerCard';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { Customer } from '../types';

const { Content } = Layout;
const { Title } = Typography;

export const CustomersPage = () => {
    const { t, isRTL } = useLanguage();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data, isLoading, error } = useCustomersData({
        page,
        per_page: 12, // 12 fits well in 3/4 column grids
        search
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    return (
        <Content>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{t('customers') || 'Customers'}</Title>
                <Input
                    placeholder={t('searchCustomers') || 'Search customers...'}
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={handleSearch}
                    style={{ maxWidth: 400 }}
                    size="large"
                />
            </div>

            {error && (
                <Alert type="error" message={t('errorLoadingCustomers')} description={error.message} style={{ marginBottom: 24 }} />
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {data?.data.map((customer) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={customer.id}>
                                <CustomerCard
                                    customer={customer}
                                    onClick={(c) => setSelectedCustomerId(c.id)}
                                />
                            </Col>
                        ))}
                    </Row>

                    {data && data.total > 0 && (
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Pagination
                                current={page}
                                total={data.total}
                                pageSize={12}
                                onChange={setPage}
                                showSizeChanger={false}
                            />
                        </div>
                    )}

                    {!isLoading && (!data || data.total === 0) && (
                        <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
                            {t('noCustomersFound') || 'No customers found'}
                        </div>
                    )}
                </>
            )}

            <CustomerDetailsModal
                customerId={selectedCustomerId}
                onClose={() => setSelectedCustomerId(null)}
            />
        </Content>
    );
};
