import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const StoreAdditionalInfo = ({ additionalStoreInfo, handleAdditionalInputChange, handleRichTextChange }) => {
    // Rich text editor modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean'],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['blockquote', 'code-block']
        ]
    };

    // Add custom CSS class for quill editors
    // You'll need to add this CSS to your global stylesheet
    // .quill-editor { min-height: 200px; }
    // .quill-editor-tall { min-height: 300px; }
    // .quill-editor-medium { min-height: 150px; }

    return (
        <div className=' w-full lg:px-4 max-w-7xl  overflow-y-auto relative'>
            <h2 className='text-2xl font-bold my-4 lg:my-0 lg:mb-4'>
                Additional Info
            </h2>
            
            <div className='grid grid-cols-2 gap-4'>
                {/* Headings */}
                <div>
                    <label className='block text-sm font-medium text-gray-700'>Heading 1</label>
                    <input 
                        type='text'
                        name='heading1'
                        value={additionalStoreInfo.heading1}
                        onChange={handleAdditionalInputChange}
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                    />
                </div>
                
                <div>
                    <label className='block text-sm font-medium text-gray-700'>Heading 2</label>
                    <input 
                        type='text'
                        name='heading2'
                        value={additionalStoreInfo.heading2}
                        onChange={handleAdditionalInputChange}
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                    />
                </div>
                
                {/* Meta Information */}
                <div>
                    <label className='block text-sm font-medium text-gray-700'>Meta Title</label>
                    <input 
                        type='text'
                        name='metaTitle'
                        value={additionalStoreInfo.metaTitle}
                        onChange={handleAdditionalInputChange}
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                    />
                </div>
                
                <div>
                    <label className='block text-sm font-medium text-gray-700'>Meta Keywords</label>
                    <input 
                        type='text'
                        name='metaKeywords'
                        value={additionalStoreInfo.metaKeywords}
                        onChange={handleAdditionalInputChange}
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                        placeholder='Separate keywords with commas'
                    />
                </div>
                
                <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700'>Meta Description</label>
                    <textarea 
                        name='metaDescription'
                        value={additionalStoreInfo.metaDescription}
                        onChange={handleAdditionalInputChange}
                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                        rows={3}
                    />
                </div>
                
                {/* Rich Text Fields with Simple Height Classes */}
                <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Terms To Do</label>
                    <div className="quill-container">
                        <ReactQuill
                            theme="snow"
                            value={additionalStoreInfo.termsTodo}
                            onChange={(value) => handleRichTextChange(value, 'termsTodo')}
                            modules={modules}
                            className="bg-white"
                            style={{ minHeight: "200px" }}
                        />
                    </div>
                </div>
                
                <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Terms Not To Do</label>
                    <div className="quill-container">
                        <ReactQuill 
                            theme="snow"
                            value={additionalStoreInfo.termsNotTodo}
                            onChange={(value) => handleRichTextChange(value, 'termsNotTodo')}
                            modules={modules}
                            className="bg-white"
                            style={{ minHeight: "200px" }}
                        />
                    </div>
                </div>
                
                <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>About</label>
                    <div className="quill-container">
                        <ReactQuill 
                            theme="snow"
                            value={additionalStoreInfo.about}
                            onChange={(value) => handleRichTextChange(value, 'about')}
                            modules={modules}
                            className="bg-white"
                            style={{ minHeight: "300px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Global CSS to be added to your application */}
            <style jsx global>{`
                .ql-container {
                    min-height: 150px;
                }
                
                /* This targets the actual editable area */
                .ql-editor {
                    min-height: 150px;
                }
                
                /* Add if you need specific height variations */
                .quill-container .ql-editor {
                    min-height: 150px;
                    max-height: 500px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
};

export default StoreAdditionalInfo;