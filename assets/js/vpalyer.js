var vm = new Vue({
    el: 'html',
    data: function() {
        return {
            audio: document.getElementsByTagName('audio')[0],
            storage: window.localStorage,
            range: 0.5,
            progress: 0,
            playingTitle: 'Hero',
            playingArtist: [{ name: 'SmK' }],
            showCurrentTime: '0:00',
            showDurationTime: '0:00',
            currentIndex: 0,
            index: 0,
            search: '',
            picUrl: 'http://p3.music.126.net/iZOGOeVEHz0fmEV4qpUjow==/1421668538040772.jpg',
            lists: [],
            playList: [],
            mlist: [],
            next: false,
            pagenumber: 1,
            pages: 0,
            offset: 30,
            isnext: false,
            lock: false,
            listOpen: false,
            isMuted: false,
            isPlay: false,
        }
    },
    ready: function() {
        this.audio.volume = 0.3;
        setInterval(this.setProgress, 500);
        this.mlist = JSON.parse(this.storage.getItem('testObject'));
        this.audio.addEventListener("ended", this.autoNextPlay);
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
        whoActive: function () {
            this.isActive.player = !this.isActive.player;
            this.isActive.search = !this.isActive.search
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
                this.lists = data.data.result.songs;
                this.isnext = true;
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
                var mdata = {
                    'id': result.id,
                    'title': result.name,
                    'url': result.mp3Url,
                    'picUrl': result.album.picUrl,
                    'artists': result.artists
                };
                this.playingTitle = result.name;
                this.playingArtist = result.artists;
                this.picUrl = result.album.picUrl;
                this.audio.src = mdata.url;
                this.audio.play();
                var obj = JSON.parse(this.storage.getItem('testObject'));
                if (this.storage.getItem('testObject') === null) {
                    this.playList.push(mdata);
                    this.storage.setItem('testObject', JSON.stringify(this.playList));
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
                        this.playList.push(mdata);
                        this.storage.setItem('testObject', JSON.stringify(this.playList));
                    } else {
                        alert('歌曲已经存在歌单');
                    };
                }
            }, function(response) {
                // error callback
            });
        },
        playHistoryList: function(id, index) {
            this.isPlay = true;
            this.$http.get('api/detailApi.php', {
                'id': id
            }).then(function(data) {
                var music = data.data.songs[0];
                this.audio.src = music.mp3Url;
                this.audio.play();
                this.playingTitle = music.name;
                this.playingArtist = music.artists;
                this.picUrl = music.album.picUrl;
                this.currentIndex = index;
                console.log(this.currentIndex);
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
                this.lists = data.data.result.songs;
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
                this.lists = data.data.result.songs;
            }, function(response) {
                // error callback
            });
        },
        autoNextPlay: function() {
            this.isPlay = false;
            var obj = JSON.parse(this.storage.getItem('testObject'));
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
            var a = this.audio;
            var z = a.buffered.end(a.buffered.length-1);
            var target = event.target;
            console.log(target.offsetWidth - this.progress);
            console.log(z);
            // setInterval(function() {
            //     drag.style.left = (audio.currentTime / audio.duration) * (window.innerWidth - 30) + "px";
            //     speed.style.left = -((window.innerWidth) - (audio.currentTime / audio.duration) * (window.innerWidth - 30)) + "px";
            // }, 500);
        }
    }
})
