import {z} from 'zod';

const UpVoteSchema = z.object({
    streamId: z.string()
})

export default UpVoteSchema
