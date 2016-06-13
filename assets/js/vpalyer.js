var vm = new Vue({
    el: 'html',
    data: function() {
        return {
            audio: document.getElementsByTagName('audio')[0],
            storage: window.localStorage,
            range: 0,
            progress: 0,
            playingTitle: 'Hero',
            playingArtist: 'SmK',
            picUrl: 'http://p3.music.126.net/iZOGOeVEHz0fmEV4qpUjow==/1421668538040772.jpg',
            showCurrentTime: '0:00',
            showDurationTime: '0:00',
            currentIndex: 0,
            index: 0,
            search: '',
            songLists: [],
            historyLists: [],
            playingLists: [],
            pagenumber: 1,
            pages: 0,
            offset: 30,
            next: false,
            isNext: false,
            lock: false,
            listOpen: false,
            isMuted: false,
            isPlay: false,
        }
    },
    ready: function() {
        this.audio.volume = 0.5;
        setInterval(this.setProgress, 500);
        this.audio.addEventListener("ended", this.autoNextPlay);
        if (this.storage.getItem('listObject') === null) { 
            this.storage.setItem('listObject', '[]'); 
        }
         this.playingLists = JSON.parse(this.storage.getItem('listObject'));
    },
    methods: {
        setAutoPlay: function() {
            this.audio.autoplay = !this.audio.autoplay;
            alert(this.audio.autoplay);
        },
        rePlayed: function() {
            this.audio.currentTime = 0;
        },
        setPlay: function() {
            this.audio.play();
            this.isPlay = !this.isPlay
            if (!this.isPlay) { this.audio.pause() }
        },
        setMtuted: function() {
            this.audio.muted = !this.audio.muted;
            this.isMuted = this.audio.muted;
        },
        setLoop: function() {
            this.audio.loop = !this.audio.loop;
            alert(this.audio.loop);
        },
        setVolume: function() {
            this.audio.volume = this.range;
            if (this.audio.volume === 0) {
                this.isMuted = true;
            } else {
                this.isMuted = false;
            }
        },
        isListOpen: function() {
            this.listOpen = !this.listOpen
        },
        setProgress: function() {
            var currentTime = this.audio.currentTime;
            MM = parseInt(currentTime / 60);
            SS = parseInt(currentTime % 60);
            var CT = MM + ':' + (SS < 10 ? '0' + SS : SS);
            this.showCurrentTime = CT;

            var duration = this.audio.duration;
            MM = parseInt(duration / 60);
            SS = parseInt(duration % 60);
            var DT = MM + ':' + (SS < 10 ? '0' + SS : SS);
            this.showDurationTime = DT;

            var value = currentTime / duration * 100;
            this.progress = value.toFixed(3);
        },
        formSubmit: function() {
            if (this.search == '') {
                return false;
            }
            this.$http.get('api/searchApi.php', {
                's': this.search
            }).then(function(data) {
                this.songLists = data.data.result.songs;
                this.isNext = true;
            }, function(response) {
                // error callback
            });
        },
        playMusic: function(id) {
            this.isPlay = true;
            this.$http.get('api/detailApi.php', {
                'id': id
            }).then(function(data) {
                var result = data.data.songs[0];
                var id = result.id, 
                title = result.name, 
                url = result.mp3Url, 
                picUrl = result.album.picUrl, 
                artists;
                if (result.artists.length === 1) {
                    artists = result.artists[0].name;
                } else if(result.artists.length === 2) {
                    artists = result.artists[0].name +'/'+ result.artists[1].name
                } else if (result.artists.length === 3) {
                    artists = result.artists[0].name +'/'+ result.artists[1].name + '/'+ result.artists[2].name;
                };
                var mdata = {
                    'id': id,
                    'title': title,
                    'url': url,
                    'picUrl': picUrl,
                    'artists': artists
                };
                this.playingTitle = title;
                this.playingArtist = artists;
                this.picUrl = picUrl;
                this.audio.src = url;
                this.audio.play();
                var obj = JSON.parse(this.storage.getItem('listObject'));
                if (obj === null) {
                    this.playingLists.push(mdata);
                    this.storage.setItem('listObject', JSON.stringify(this.playingLists));
                } else {
                    for (var i = 0; i < obj.length; i++) {
                        if (mdata.url === obj[i].url) {
                            this.lock = true;
                            break;
                        } else {
                            this.lock = false;
                        }
                    };
                    if (this.lock == false) {
                        this.playingLists = obj;
                        this.playingLists.push(mdata);
                        this.storage.setItem('listObject', JSON.stringify(this.playingLists));
                    } else {
                        alert('歌曲已经存在歌单');
                    };
                }
            }, function(response) {
                // error callback
            });
        },
        playHistoryList: function(id, index) {
            this.isPlay = false;
            this.$http.get('api/detailApi.php', {
                'id': id
            }).then(function(data) {
                var music = data.data.songs[0];
                this.audio.src = music.mp3Url;
                setTimeout(this.setPlay, 1500);
                var artists;
                if (music.artists.length === 1) {
                    artists = music.artists[0].name;
                } else if(music.artists.length === 2) {
                    artists = music.artists[0].name +'/'+ music.artists[1].name
                } else if (music.artists.length === 3) {
                    artists = music.artists[0].name +'/'+ music.artists[1].name + '/'+ music.artists[2].name;
                };
                this.playingTitle = music.name;
                this.playingArtist = artists;
                this.picUrl = music.album.picUrl;
                this.currentIndex = index;
            }, function(response) {
                // error callback
            });
        },
        previousPage: function() {
            this.pages = this.pages - this.offset;
            this.pagenumber--;
            this.$http.get('api/pagesApi.php', {
                's': this.search,
                'p': this.pages
            }).then(function(data) {
                this.songLists = data.data.result.songs;
            }, function(response) {
                // error callback
            });
        },
        nextPage: function() {
            this.next = true;
            p = this.pagenumber++;
            this.pages = p * this.offset;
            this.$http.get('api/pagesApi.php', {
                's': this.search,
                'p': this.pages
            }).then(function(data) {
                this.songLists = data.data.result.songs;
            }, function(response) {
                // error callback
            });
        },
        autoNextPlay: function() {
            this.isPlay = false;
            var obj = JSON.parse(this.storage.getItem('listObject'));
            this.index = ++this.currentIndex;
            if (this.index == obj.length) {
                this.currentIndex = 0;
                this.index = 0;
            }
            if (!this.audio.loop) {
                this.audio.pause();
                this.audio.src = obj[this.index].url;
                this.audio.load();
                this.playingTitle = obj[this.index].title;
                this.playingArtist = obj[this.index].artists;
                this.picUrl = obj[this.index].picUrl;
                setTimeout(this.setPlay, 2000);
            }
        },
        clickProgress: function(event) {
            var target = event.target;
            console.log(target.clientWidth);
            console.log(target.offsetWidth);
            // setInterval(function() {
            //     drag.style.left = (audio.currentTime / audio.duration) * (window.innerWidth - 30) + "px";
            //     speed.style.left = -((window.innerWidth) - (audio.currentTime / audio.duration) * (window.innerWidth - 30)) + "px";
            // }, 500);
        }
    }
})
