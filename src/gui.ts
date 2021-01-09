import { A, Article, Button, Details, Div, H2, Img, Main, P, Small, Summary } from "./domfluid"
import { AggregateFeed, Channel, clearData, FeedType, loadChannels, loadFeeds, MakeAggregateFeed, MakeFeed, RssArticle, RssData, RssHeader, saveChannels, shapeFeeds, updateFeeds } from "./rss"

const setChildren = (parent: HTMLElement, children: HTMLElement[]) => {
    parent.innerHTML = null
    for (let ch of children) ch && parent.appendChild(ch)
}

const setVisibility = (el: HTMLElement, visible: boolean) => {
    visible ? el.classList.remove('hidden') : el.classList.add('hidden')
}

const linkifyMedia = (root: HTMLElement) => {
    const media: HTMLElement[] = root.querySelectorAll('img, video') as any

    for (let med of media) {
        med.style.maxWidth = null
        med.style.cursor = 'pointer'
        med.addEventListener('click', () => {
            const source = (med as HTMLImageElement).src || med.querySelector('source').src
            const win = window.open(source, '_blank');
            win.focus()
        })
    }

    return root
}

const DateTime = (d: Date) => Small({ text: d.toDateString() })

type ArticleGuiData = {
    guid: string,
    title: string,
    link: string,
    date: Date,
    description: string,
    thumbnail?: string,
    // used to do a channel header lookup
    // when the article is presented in an aggregate feed
    channelHeader?: RssHeader,
}


type FeedTypeGui = { id: string, render: (a: ArticleGuiData) => HTMLElement }

type FeedTypeGuis = {
    [FeedType.MicroBlog]: FeedTypeGui,
    [FeedType.Video]: FeedTypeGui,
    [FeedType.Article]: FeedTypeGui,
}

let loadIndividualChannel: (name: string) => () => any = null

const inlineChannelRenderer = (head: RssHeader, onClick: () => any, ...children: HTMLElement[]) => Div({ class: 'channel-info-inline' },
    head.image && Img({ src: head.image }),
    head.url ?
        A({ href: '#', onClick }, Small({ text: head.title }))
        : Small({ text: head.title }),
    ...children)

const dateAndChannelInfo = (head: RssHeader, date: Date, onChannelNameClick: () => any) =>
    head ?
        inlineChannelRenderer(head, onChannelNameClick, DateTime(date))
        : DateTime(date)

const feedGuis: FeedTypeGuis = {
    [FeedType.MicroBlog]: {
        id: 'microblog',
        render: (a: ArticleGuiData) => Article({},
            dateAndChannelInfo(a.channelHeader, a.date, loadIndividualChannel(a.channelHeader.name)),
            linkifyMedia(Main({ innerHTML: a.description })))
    },
    [FeedType.Video]: {
        id: 'videos',
        render: (a: ArticleGuiData) => Article({},
            // /* shitty mpv forwarding */ Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
            A({ href: a.link, target: '_blank' },
                Img({ src: a.thumbnail }),
                H2({ text: a.title })),
            dateAndChannelInfo(a.channelHeader, a.date, loadIndividualChannel(a.channelHeader.name)),
            Details({},
                Summary({ text: 'Description' }),
                Main({ text: a.description })))
    },
    [FeedType.Article]: {
        id: 'articles',
        render: (a: ArticleGuiData) => Article({},
            A({ href: a.link, target: '_blank' },
                H2({ text: a.title })),
            dateAndChannelInfo(a.channelHeader, a.date, loadIndividualChannel(a.channelHeader.name)),
            Main({ innerHTML: a.description }))
    },
}

const makeConfig = (corsProxy: string, channels: Channel[]) => ({ corsProxy, channels })

interface GuiDependencies {
    layout: HTMLElement,
    sidebar: HTMLElement,
    channelInfoContainer: HTMLElement,
    articleContainer: HTMLElement,
    menuBtn: HTMLButtonElement,
    nextBtn: HTMLButtonElement,
    prevBtn: HTMLButtonElement
    updateBtn: HTMLButtonElement
    importBtn: HTMLButtonElement
    exportBtn: HTMLButtonElement
    updateProgress: HTMLElement,
    lastUpdated: HTMLElement,
}

export default async ({
    layout,
    sidebar,
    channelInfoContainer,
    articleContainer,
    menuBtn,
    nextBtn,
    prevBtn,
    updateBtn,
    importBtn,
    exportBtn,
    updateProgress,
    lastUpdated,
}: GuiDependencies) => {

    const main = layout.querySelector('main')
    const desktopWidth = 1200


    const defaultConfig = makeConfig('https://cors.vec-t.com/', [
        MakeAggregateFeed('twitter', FeedType.MicroBlog, [
            MakeFeed('POTUS', 'https://nitter.net/potus/rss'),
            MakeFeed('Obama', 'https://nitter.net/barackobama/rss'),
        ])
    ])

    const channels = loadChannels() || saveChannels(defaultConfig.channels)
    const corsProxy = localStorage.getItem('corsProxy') || (() => {
        localStorage.setItem('corsProxy', defaultConfig.corsProxy)
        return defaultConfig.corsProxy
    })()

    // flattened list of channel->articles
    // used when clicking on channel name in aggregate list to show only posts from this user
    let flatArticleMap: Map<string, RssArticle[]>

    let data: RssData | null
    let lastChannel: Channel | null
    let currentPage = 0


    const showFeed = (channel: Channel, page = 0, isFlat = false) => {
        if (window.innerWidth < desktopWidth) layout.classList.add('menu-hidden')

        lastChannel = channel
        const articleMap = isFlat ? flatArticleMap : data.articleMap
        let articles: ArticleGuiData[] = articleMap.get(channel.name).map(({ guid, title, link, date, description, thumbnail, channelName }) =>
            ({ guid, title, link, date, description, thumbnail, channelHeader: channel.kind == 'aggregate' && data.headerMap.get(channelName) }))


        const displayType = channel.type || FeedType.Article

        currentPage = page
        const itemsPerPage = 30
        const displayFrom = itemsPerPage * page
        const displayTo = itemsPerPage * (page + 1)
        const len = articles.length
        articles = articles.slice(displayFrom, displayTo)

        setVisibility(prevBtn, page > 0)
        setVisibility(nextBtn, len > displayTo)

        const header = data.headerMap.get(channel.name)
        setVisibility(channelInfoContainer, channel.kind == 'single' && !!header)

        if (header) {
            setChildren(channelInfoContainer, [
                header.image && Img({ src: header.image }),
                Div({},
                    header.title && (header.url
                        ? A({ href: header.url }, H2({ text: header.title }))
                        : H2({ text: header.title })),
                    header.description && P({ text: header.description }),
                )

            ])
        }

        const gui = feedGuis[displayType]

        articleContainer.id = gui.id
        const articleNodes = articles.map(gui.render)

        setChildren(articleContainer, articleNodes)
        main.scrollTop = 0
    }

    const populateChannelList = (channels: Channel[]) =>
        setChildren(sidebar, channels.map((c) =>
            Button({
                text: c.name,
                class: 'channel-button',
                onClick: () => showFeed(c),
            })))

    const renderLastUpdated = () => {
        lastUpdated.textContent = `Last updated: ${localStorage.getItem('lastUpdated') || ''}`
    }

    const showData = async (forceUpdate = false, page = 0) => {
        const countUpdated = (x, y) => {
            if (x == 0) {
                setVisibility(updateProgress, true)
                setVisibility(lastUpdated, false)
            } else if (x == y) {
                setVisibility(updateProgress, false)
                setVisibility(lastUpdated, true)
                const dateText = new Date().toLocaleDateString()
                localStorage.setItem('lastUpdated', dateText)
                renderLastUpdated()
            }

            updateProgress.querySelector('span').textContent = `${x}/${y}`
        }
        const oldData = await loadFeeds()
        if (oldData.articleMap.size > 0 && !forceUpdate) {
            flatArticleMap = oldData.articleMap
            oldData.articleMap = shapeFeeds(oldData.articleMap, channels)
            data = oldData
        } else {
            [data, flatArticleMap] = await updateFeeds(channels, corsProxy, countUpdated)
        }
        console.log(data)
        console.log('flatboys', flatArticleMap)

            ; (window as any).data = data

        showFeed((lastChannel || channels[0]), page)
    }

    const toggleMenu = () => {
        const hidden = layout.classList.contains('menu-hidden')
        if (hidden) {
            layout.classList.remove('menu-hidden')
        } else {
            layout.classList.add('menu-hidden')
        }
    }

    loadIndividualChannel = name => () => {
        const last = (lastChannel as AggregateFeed)
        const thisChannel = last.feeds.filter(f => f.name == name)[0]
        if (thisChannel.type == null) thisChannel.type = last.type
        showFeed(thisChannel, 0, true)
    }


    if (window.innerWidth < desktopWidth) toggleMenu()
    renderLastUpdated()

    menuBtn.addEventListener('click', toggleMenu)

    prevBtn.addEventListener('click', () => showFeed(lastChannel, currentPage - 1))
    nextBtn.addEventListener('click', () => showFeed(lastChannel, currentPage + 1))
    updateBtn.addEventListener('click', () => showData(true, currentPage))

    const download = (text: string, filename: string) => {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }
    exportBtn.addEventListener('click', () => {
        const data = JSON.stringify({ corsProxy, channels }, null, 2)
        console.log(data)
        download(data, 'rssConfig.json')
    })

    importBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = 'application/json'
        fileInput.click()
        fileInput.addEventListener('change', async () => {
            const t = await fileInput.files[0]?.text()
            if (!t) return;

            const config = JSON.parse(t)
            if (config.corsProxy && config.channels) {
                // assume it has the correct shape
                console.log(config)

                localStorage.setItem('corsProxy', config.corsProxy)
                saveChannels(config.channels)
                clearData()
                window.location.reload()
            } else {
                alert('incorrect json object shape')
            }

        })
    })

    showData()
    populateChannelList(channels)
}
