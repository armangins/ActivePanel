import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { theme } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

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

    return (
        <div className={`rich-text-editor ${isRTL ? 'rtl' : 'ltr'}`} style={style}>
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
            <style>
                {`
                    .rich-text-editor .quill {
                        background-color: ${token.colorBgContainer};
                        border-radius: ${token.borderRadius}px;
                        transition: all 0.2s;
                    }
                    .rich-text-editor .ql-toolbar {
                        border: 1px solid ${token.colorBorder} !important;
                        border-top-left-radius: ${token.borderRadius}px;
                        border-top-right-radius: ${token.borderRadius}px;
                        background-color: ${token.colorBgLayout};
                        direction: ltr; /* Toolbar always LTR */
                        text-align: left;
                    }
                    .rich-text-editor .ql-container {
                        border: 1px solid ${token.colorBorder} !important;
                        border-top: none !important;
                        border-bottom-left-radius: ${token.borderRadius}px;
                        border-bottom-right-radius: ${token.borderRadius}px;
                        font-family: ${token.fontFamily};
                        font-size: ${token.fontSize}px;
                    }
                    .rich-text-editor .ql-editor {
                        min-height: 150px;
                        direction: ${isRTL ? 'rtl' : 'ltr'};
                        text-align: ${isRTL ? 'right' : 'left'};
                        color: ${token.colorText};
                    }
                    .rich-text-editor .ql-editor.ql-blank::before {
                        color: ${token.colorTextPlaceholder};
                        font-style: normal;
                        right: ${isRTL ? '15px' : 'auto'};
                        left: ${isRTL ? 'auto' : '15px'};
                    }
                    
                    /* Hover effect */
                    .rich-text-editor:hover .ql-toolbar,
                    .rich-text-editor:hover .ql-container {
                        border-color: ${token.colorPrimaryHover} !important;
                    }

                    /* Focus effect usually handled by a class, but ReactQuill doesn't expose it easily on the container. 
                       We can simulate it or just rely on the editor focus. 
                       For now, let's keep it simple with hover. */
                `}
            </style>
        </div>
    );
};
