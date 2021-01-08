export enum FeedType {
    Article = 'article',
    MicroBlog = 'microblog',
    Video = 'video',
}

export type Feed = {
    kind: 'single',
    name: string,
    type: FeedType | null,
    source: string,
}

export type AggregateFeed = {
    kind: 'aggregate',
    name: string,
    type: FeedType,
    feeds: Feed[],
}

export type Channel = Feed | AggregateFeed

export type SerializedRssData = {
    channels: Channel[],
}

export type RssArticle = {
    guid: string,
    title: string,
    link: string,
    date: Date,
    description: string,
    thumbnail: string | null,
}

export type RssData = Map<string, RssArticle[]>

export const MakeFeed = (name: string, source: string, type: FeedType = null): Feed =>
    ({ kind: 'single', name, source, type })

export const MakeAggregateFeed = (name: string, type: FeedType, feeds: Feed[] = []): AggregateFeed =>
    ({ kind: 'aggregate', name, type, feeds })

export const saveChannels = (channels: Channel[]) => {
    localStorage.setItem('rssChannels', JSON.stringify(channels))
    return channels
}

export const loadChannels = (): Channel[] =>
    JSON.parse(localStorage.getItem('rssChannels'))

export const parseRss = (feed: string): RssArticle[] => {
    const dom: Document = new window.DOMParser().parseFromString(feed, "text/xml")

    const isYoutube = dom.querySelector('feed')?.getAttribute('xmlns:yt')

    const items: RssArticle[] = []

    if (isYoutube) {

        const domItems = dom.querySelectorAll('entry')

        for (let it of domItems) {
            items.push({
                guid: it.querySelector('link')?.getAttribute('href'),
                title: it.querySelector('title')?.textContent,
                // link: it.querySelector('link')?.textContent,
                link: it.querySelector('link')?.getAttribute('href'),
                // date: new Date(it.querySelector('pubDate')?.textContent),
                date: new Date(it.querySelector('published')?.textContent),
                description: it.querySelector('description')?.textContent,
                thumbnail: (it.getElementsByTagName('media:group')[0].getElementsByTagName('media:thumbnail')[0]).getAttribute('url'),
            })
        }
    } else {
        const domItems = dom.querySelectorAll('channel item')

        for (let it of domItems) {
            items.push({
                guid: it.querySelector('guid')?.textContent,
                title: it.querySelector('title')?.textContent,
                link: it.querySelector('link')?.textContent,
                date: new Date(it.querySelector('pubDate')?.textContent),
                description: it.querySelector('description')?.textContent,
                thumbnail: (it.getElementsByTagName('media:thumbnail')[0] || it.querySelector('enclosure'))?.getAttribute('url'),
            })
        }
    }

    console.log(dom)

    return items
}

export const clearData = () => localStorage.removeItem('feedInfo')

/**
 * loads feeds from localstorage
 * 
 * they are stored as a flat map, use `shapeFeeds()` to make aggregate feeds
 */
export const loadFeeds = async () => {
    const str = localStorage.getItem('feedInfo')

    const data = new Map<string, RssArticle[]>()

    if (!str) return data

    const obj = JSON.parse(str)

    console.log(obj)

    for (let k of Object.keys(obj)) {
        console.log('ok....')
        console.log(k)
        for (let ar of obj[k]) {
            ar.date = new Date(ar.date)
        }
        data.set(k, obj[k])
    }

    return data
}

export const shapeFeeds = (data: RssData, channels: Channel[]) => {
    const shaped = new Map<string, RssArticle[]>()

    for (let ch of channels) {
        switch (ch.kind) {
            case 'aggregate':
                const aggragatedArticles = ch.feeds.reduce((arr, feed) => {
                    console.log('adding ' + feed.name)
                    return arr.concat(data.get(feed.name))
                }, [] as RssArticle[])
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                shaped.set(ch.name, aggragatedArticles)
                break
            case 'single':
                shaped.set(ch.name, data.get(ch.name))
                break
        }
    }

    return shaped
}

export const updateFeed = async (feed: Feed, corsProxy: string) => {
    const url = `${corsProxy}${feed.source}`
    console.log('updating ' + url)
    const res = await fetch(url)
    const text = await res.text()

    const articles = parseRss(text)

    return articles
}

export const updateFeeds = async (channels: Channel[], corsProxy: string, progressCallback: (completed: number, total: number) => any): Promise<RssData> => {
    const feedInfo = new Map() //await loadFeeds()

    let completed = 0
    const channelCount = channels.reduce((acc, c) => c.kind == 'single' ? acc + 1 : acc + c.feeds.length, 0)

    progressCallback(0, channelCount)
    const incrementCompletion = () => progressCallback(++completed, channelCount)
    for (let ch of channels) {
        let articles: RssArticle[] = []

        switch (ch.kind) {
            case 'aggregate': {
                for (let fd of ch.feeds) {
                    const old = feedInfo.get(fd.name) || []
                    const feedArticles = await updateFeed(fd, corsProxy)
                    incrementCompletion()
                    feedInfo.set(fd.name, old.concat(feedArticles))
                }

                break
            }
            case 'single': {
                const old = feedInfo.get(ch.name) || []
                articles = await updateFeed(ch, corsProxy)
                incrementCompletion()
                feedInfo.set(ch.name, old.concat(articles))
                break
            }
        }

        feedInfo.set(ch.name, articles)
    }

    // fake completion for now
    if (completed != channelCount) {
        console.log('fake completion')
        progressCallback(channelCount, channelCount)
    }


    localStorage.setItem('feedInfo', JSON.stringify(Object.fromEntries(feedInfo)))

    console.log('done!')
    console.log(feedInfo)

    return shapeFeeds(feedInfo, channels)
}
