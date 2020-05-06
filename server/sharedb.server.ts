import RichText from 'rich-text'
import ShareDB from 'sharedb'

ShareDB.types.register(RichText.type)

export default new ShareDB()


