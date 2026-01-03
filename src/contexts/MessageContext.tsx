import { ReactNode, createContext, useContext } from 'react';
import { useCenteredMessage } from '@/hooks/useCenteredMessage';
import type { MessageInstance } from 'antd/es/message/interface';

const MessageContext = createContext<MessageInstance | null>(null);

interface MessageProviderProps {
    children: ReactNode;
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
    const [messageApi, contextHolder] = useCenteredMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = (): MessageInstance => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};
