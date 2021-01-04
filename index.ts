import { AggregateFeed, AggregateFeedType, Channel, Feed, loadChannels, MakeAggregateFeed, MakeFeed, saveChannels } from "./rss"

let channels: Channel[] = []

const channelList = document.createElement('div')
channelList.id = 'channel-list'

const populateChannelList = (channels: Channel[]): HTMLElement => {
    channelList.innerHTML = null

    const buttons = channels.map((c, i) => {
        const b = document.createElement('button')
        b.classList.add('channel-button')
        b.textContent = c.name
        b.addEventListener('click', () => console.log(`${i} ${c.name}`))
        return b
    })

    for (let b of buttons) channelList.appendChild(b)

    return channelList
}

const s = document.querySelector('#sidebar')
document.querySelector('#save-channels').addEventListener('click', () => {
    saveChannels(channels)
})

document.querySelector('#load-channels').addEventListener('click', () => {
    const channels = loadChannels()
    s.append(populateChannelList(channels))
})

/**** for testing purposes */

channels = [
    MakeFeed('lukesmith.xyz', 'https://lukesmith.xyz/rss.xml'),
    MakeAggregateFeed('Videos', AggregateFeedType.Video, [
        MakeFeed('Typh', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdARcqAEmGmU9ppAx8KHiVQ'),
        MakeFeed('Context free', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCS4FAVeYW_IaZqAbqhlvxlA'),
    ])
]

s.append(populateChannelList(channels))

/**** for testing purposes */
