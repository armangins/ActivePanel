import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { theme } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

import './RichTextEditor.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder,
    style
}) => {
    const { isRTL } = useLanguage();
    const { token } = theme.useToken();

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    // Map Ant Design tokens to CSS variables
    const dynamicStyle = {
        '--rte-bg-container': token.colorBgContainer,
        '--rte-border-radius': `${token.borderRadius}px`,
        '--rte-border-color': token.colorBorder,
        '--rte-bg-layout': token.colorBgLayout,
        '--rte-font-family': token.fontFamily,
        '--rte-font-size': `${token.fontSize}px`,
        '--rte-text-color': token.colorText,
        '--rte-placeholder-color': token.colorTextPlaceholder,
        '--rte-primary-hover': token.colorPrimaryHover,
        '--rte-text-description': token.colorTextDescription,
        ...style,
    } as React.CSSProperties;

    return (
        <div className={`rich-text-editor ${isRTL ? 'rtl' : 'ltr'}`} style={dynamicStyle}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{
                    direction: isRTL ? 'rtl' : 'ltr',
                    textAlign: isRTL ? 'right' : 'left',
                }}
            />
        </div>
    );
};
