export enum AggregateFeedType {
    Article,
    MicroBlog,
    Video,
}

export type Feed = {
    kind: 'single',
    name: string,
    source: string,
}

export type AggregateFeed = {
    kind: 'aggregate',
    name: string,
    type: AggregateFeedType,
    feeds: Feed[],
}

export type Channel = Feed | AggregateFeed

export type SerializedRssData = {
    channels: Channel[],
}

export const MakeFeed = (name: string, source: string): Feed =>
    ({ kind: 'single', name, source })

export const MakeAggregateFeed = (name: string, type: AggregateFeedType, feeds: Feed[] = []): AggregateFeed =>
    ({ kind: 'aggregate', name, type, feeds })

export const saveChannels = (channels: Channel[]) =>
    localStorage.setItem('rssChannels', JSON.stringify(channels))

export const loadChannels = (): Channel[] =>
    JSON.parse(localStorage.getItem('rssChannels')) || []

