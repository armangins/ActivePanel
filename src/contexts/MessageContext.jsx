import React, { createContext, useContext } from 'react';
import { useCenteredMessage } from '../hooks/useCenteredMessage';

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
    const [messageApi, contextHolder] = useCenteredMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};
