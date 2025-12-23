import React, { useMemo } from 'react';
import { Modal, Progress, Typography, Button, Space } from 'antd';
import { UploadProgress } from '../../types/upload';
import { useAnimatedProgress } from '../../hooks/useAnimatedProgress';

const { Text } = Typography;

interface ProductUploadProgressProps {
    visible: boolean;
    progress: UploadProgress;
    onCancel: () => void;
    onAddAnother?: () => void;
    onGoToProducts?: () => void;
}

const getStageLabel = (stage: UploadProgress['stage']): string => {
    switch (stage) {
        case 'uploading-images':
            return 'העלאת תמונות';
        case 'creating-product':
            return 'יצירת מוצר';
        case 'creating-variations':
            return 'יצירת וריאציות';
        case 'complete':
            return 'הושלם!';
        default:
            return '';
    }
};

export const ProductUploadProgress: React.FC<ProductUploadProgressProps> = ({
    visible,
    progress,
    onCancel,
    onAddAnother,
    onGoToProducts
}) => {
    // Animate progress smoothly with 800ms duration
    const animatedProgress = useAnimatedProgress(progress.percentage, 800);

    const strokeColor = useMemo(() => ({
        '0%': '#1890ff',
        '100%': '#52c41a'
    }), []);

    const progressFormat = useMemo(() => {
        return () => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>
                    {Math.round(animatedProgress)}%
                </div>
                <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                    {getStageLabel(progress.stage)}
                </div>
            </div>
        );
    }, [animatedProgress, progress.stage]);

    return (
        <Modal
            open={visible}
            closable={false}
            footer={null}
            centered
            width={400}
            styles={{
                body: { padding: 40 }
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <Progress
                    type="circle"
                    percent={animatedProgress}
                    strokeColor={strokeColor}
                    strokeWidth={8}
                    size={200}
                    format={progressFormat}
                />

                <div style={{ marginTop: 32 }}>
                    <Text style={{ fontSize: 15, color: '#595959' }}>
                        {progress.currentStep}
                    </Text>
                </div>

                {progress.stage !== 'complete' && (
                    <Button
                        type="text"
                        onClick={onCancel}
                        style={{ marginTop: 24 }}
                        danger
                    >
                        ביטול
                    </Button>
                )}

                {progress.stage === 'complete' && (
                    <Space direction="vertical" size="middle" style={{ marginTop: 32, width: '100%' }}>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={onAddAnother}
                        >
                            הוסף מוצר נוסף
                        </Button>
                        <Button
                            size="large"
                            block
                            onClick={onGoToProducts}
                        >
                            עבור לעמוד המוצרים
                        </Button>
                    </Space>
                )}
            </div>
        </Modal>
    );
};
