import API from "../axios";
import { endpoints } from "../endpoints";

export const blogService = {
list: (page = 1, filters = {}) => {
  const params = { 
    source: 'dashboard',
    page: page,
    ...filters  // Spread all filters as individual parameters
  };
  
  return API.get(endpoints.blogs.list, { params });
},

    create : (data)=>{
      //  console.log("data ",data);
        
    const formData = new FormData();
    formData.append("author", data.author);
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("status", data.status);
    formData.append("content", data.content);
    if (data.titleImage?.file) {
      formData.append("titleImage", data.titleImage?.file);
     // console.log("Data appended");
      
    }

    return API.post(endpoints.blogs.create, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    delete: (ids) => API.delete(endpoints.blogs.delete, {

        data: { ids }
    }),

    importDataJson: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return API.post(endpoints.blogs.importData, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });


    },
    getById: (id) => API.get(endpoints.blogs.getById(id)),

    // ✅ Update existing Blog
    update: (id, data) => {
      // console.log("this is data",data);
        
    const formData = new FormData();
    formData.append("author", data.author);
    formData.append("title", data.title);
    formData.append("category", data.category);
    formData.append("status", data.status);
    formData.append("content", data.content);
    if (data.titleImage) {
      formData.append("titleImage", data.titleImage);
     // console.log("Data appended");
      
    }

        // Debug: Log FormData contents
    // console.log('FormData contents before sending:');
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }




        return API.put(endpoints.blogs.update(id), formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

            // ✅ Bulk update multiple products
    bulkUpdate: (bulkData) => {
       // console.log("this is path",endpoints.product.bulkUpdate);
        
        return API.put(endpoints.blogs.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },
      sampleData: () => {
    return API.get(endpoints.blogs.sample, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    });
}

}