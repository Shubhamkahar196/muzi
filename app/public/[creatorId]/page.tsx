import PublicStreamView from "@/app/components/PublicStreamView";

export default async function PublicPage({
    params
}:{
    params: Promise<{ creatorId: string }>
}){
    const { creatorId } = await params;
    return <div>
        <PublicStreamView creatorId={creatorId} />
    </div>
}
