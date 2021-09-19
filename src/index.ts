import makeGui from './gui'

// const CORSproxies = [
//     'https://cors.vec-t.com/',
//     'https://cors-anywhere.herokuapp.com/',
//     'http://www.whateverorigin.org/get?url=',
//     'http://dry-sierra-94326.herokuapp.com/',
//     'https://thingproxy.freeboard.io/fetch/',
//     'https://cors.now.sh/',
//     'http://fuck-cors.com/?url=',
// ]

makeGui({
  layout: document.querySelector('#layout'),
  sidebar: document.getElementById('channel-list'),
  channelInfoContainer: document.getElementById('channel-info'),
  articleContainer: document.getElementById('articles'),
  menuBtn: document.querySelector('.menu-btn'),
  nextBtn: document.getElementById('btn-next') as HTMLButtonElement,
  prevBtn: document.getElementById('btn-previous') as HTMLButtonElement,
  updateBtn: document.querySelector('#update-channels'),
  importBtn: document.querySelector('#btn-import'),
  exportBtn: document.querySelector('#btn-export'),
  updateProgress: document.querySelector('.progress'),
  lastUpdated: document.querySelector('.last-updated')
})
