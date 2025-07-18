import { Client, Databases, Query, ID } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTIONS_ID

// const PROJECT_ID = '687a172b001bb9543320'
// const DATABASE_ID = '687a66c20034aaa3d4db'
// const COLLECTION_ID = '687a671900180831d8c5'

const client = new Client().setEndpoint('https://syd.cloud.appwrite.io/v1').setProject(PROJECT_ID)
const databases = new Databases(client)

export const updateSearchCount = async (searchTerm, movie) => {
    // console.log(PROJECT_ID, DATABASE_ID, COLLECTION_ID)
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ])
        console.log('Search result:', result);
        if (result.documents.length > 0) {
            const doc = result.documents[0]
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                count: 1
            })
        }
        console.log(result)
    } catch (error) {
        console.log(error)
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc('count'),
            Query.limit(5)
        ])
       
        return result.documents
    } catch (error) {
        console.log(error)
    }
}