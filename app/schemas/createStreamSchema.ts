
import {z} from 'zod'


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string().min(1, "URL cannot be empty"),    //todo make more strict only yt and spotify
})

export default CreateStreamSchema
