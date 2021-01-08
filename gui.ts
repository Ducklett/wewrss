import { A, Article, Button, Details, H2, Img, Main, Small, Summary } from "./domfluid"
import { Channel, clearData, FeedType, loadChannels, loadFeeds, MakeAggregateFeed, MakeFeed, RssArticle, RssData, saveChannels, shapeFeeds, updateFeeds } from "./rss"

const setChildren = (parent: HTMLElement, children: HTMLElement[]) => {
    parent.innerHTML = null
    for (let ch of children) parent.appendChild(ch)
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

type FeedTypeGui = { id: string, render: (a: RssArticle) => HTMLElement }

type FeedTypeGuis = {
    [FeedType.MicroBlog]: FeedTypeGui,
    [FeedType.Video]: FeedTypeGui,
    [FeedType.Article]: FeedTypeGui,
}

const feedGuis: FeedTypeGuis = {
    [FeedType.MicroBlog]: {
        id: 'microblog',
        render: (a: RssArticle) => Article({},
            DateTime(a.date),
            linkifyMedia(Main({ innerHTML: a.description })))
    },
    [FeedType.Video]: {
        id: 'videos',
        render: (a: RssArticle) => Article({},
            // /* shitty mpv forwarding */ Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
            A({ href: a.link, target: '_blank' },
                Img({ src: a.thumbnail }),
                H2({ text: a.title })),
            DateTime(a.date),
            Details({},
                Summary({ text: 'Description' }),
                Main({ text: a.description })))
    },
    [FeedType.Article]: {
        id: 'articles',
        render: (a: RssArticle) => Article({},
            A({ href: a.link, target: '_blank' },
                H2({ text: a.title })),
            DateTime(a.date),
            Main({ innerHTML: a.description }))
    },
}

const makeConfig = (corsProxy: string, channels: Channel[]) => ({ corsProxy, channels })

interface GuiDependencies {
    layout: HTMLElement,
    sidebar: HTMLElement,
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

    let data: RssData | null
    let lastChannel: Channel | null
    let currentPage = 0

    const showFeed = (channel: Channel, page = 0) => {
        if (window.innerWidth < desktopWidth) layout.classList.add('menu-hidden')

        lastChannel = channel
        let articles = data.get(channel.name)
        const displayType = channel.type || FeedType.Article

        currentPage = page
        const itemsPerPage = 30
        const displayFrom = itemsPerPage * page
        const displayTo = itemsPerPage * (page + 1)
        const len = articles.length
        articles = articles.slice(displayFrom, displayTo)

        console.log('page', page)
        console.log('len', len)
        console.log('to', displayTo)
        setVisibility(prevBtn, page > 0)
        setVisibility(nextBtn, len > displayTo)

        const gui = feedGuis[displayType]
        articleContainer.id = gui.id
        const articleNodes = articles.map(gui.render)

        setChildren(articleContainer, articleNodes)
    }

    const populateChannelList = (channels: Channel[]) =>
        setChildren(sidebar, channels.map((c) =>
            Button({
                text: c.name,
                class: 'channel-button',
                onClick: () => showFeed(c),
            })))

    const renderLastUpdated = () => {
        lastUpdated.textContent = `Last updated: ${localStorage.getItem('lastUpdated')||''}`
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
        const flatData = await loadFeeds()
        data = (flatData.size > 0 && !forceUpdate)
            ? shapeFeeds(flatData, channels)
            : await updateFeeds(channels, corsProxy, countUpdated)
        console.log(data)

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
