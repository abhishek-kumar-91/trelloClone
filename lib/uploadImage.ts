import { ID, storage } from "@/appwrite";


const uploadImage = async(file: File) =>{
    if(!file) return;

    const fileUploaded = await storage.createFile(
        "653d0ce232189620c9e0",
        ID.unique(),
        file
    );

    return fileUploaded;
}

export default uploadImage;