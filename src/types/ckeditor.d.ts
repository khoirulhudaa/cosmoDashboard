// ckeditor.d.ts
declare module '@ckeditor/ckeditor5-react' {
  import * as React from 'react';

  export interface CKEditorProps {
    editor: any;
    data?: string;
    config?: Record<string, any>;
    onReady?: (editor: any) => void;
    onChange?: (event: any, editor: any) => void;
    onBlur?: (event: any, editor: any) => void;
    onFocus?: (event: any, editor: any) => void;
    disabled?: boolean;
  }

  export const CKEditor: React.FC<CKEditorProps>;
}

declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: any;
  export default ClassicEditor;
}