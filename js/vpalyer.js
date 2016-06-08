new Vue({
    el: 'body',
    data: function() {
        return {
            audio: document.getElementsByTagName('audio')[0],
            storage: window.localStorage,
            range: 0.5,
            progress: 0,
            autoplay: false,
            loop: false,
            showCurrentTime: '0:00',
            showDurationTime: '0:00',
            search: '',
            lists: [],
            playList: [],
            mlist: [],
            next: false,
            pagenumber: 1,
            isnext: false,
            lock: false,
            pages: 0,
            offset: 30,
        }
    },
    ready: function() {
        setInterval(this.setProgress, 500);
        var isAuto = this.storage.getItem('autoplay');
        isAuto === 'true' ? this.audio.autoplay = true : this.audio.autoplay = false;
        var isLoop = this.storage.getItem('loop');
        isLoop === 'true' ? this.audio.loop = true : this.audio.loop = false;
        this.mlist = JSON.parse(this.storage.getItem('testObject'));
        this.autoNextPlay();
    },
    methods: {
        setAutoPlay: function() {
            this.autoplay = !this.autoplay;
            alert(this.autoplay);
            this.storage.setItem('autoplay', this.autoplay);
        },
        rePlayed: function () {
            this.audio.currentTime = 0;
        },
        setPlay: function() {
            this.audio.play();
        },
        setPause: function() {
            this.audio.pause();
        },
        nextMusic: function() {
            this.audio.src = 'http://m2.music.126.net/HC_jFzN5KjTRShZ3-vL8HA==/7761452581574887.mp3'
            this.audio.play();
        },
        seMtuted: function() {
            this.audio.muted = !this.audio.muted;
        },
        setLoop: function() {
            this.loop = !this.loop;
            alert(this.loop);
            this.storage.setItem('loop', this.loop);
        },
        setVolume: function() {
            return this.audio.volume = this.range;
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
            this.$http.get('api/detailApi.php', {
                'id': id
            }).then(function(data) {
                var result = data.data.songs[0];
                var mdata = {
                    'id': result.id,
                    'title': result.name,
                    'url':result.mp3Url,
                    'artists':result.artists[0].name
                };
                this.audio.src = mdata.url;
                this.audio.play();
                var obj = JSON.parse(this.storage.getItem('testObject'));
                if (this.storage.getItem('testObject') === null) {
                    this.playList.push(mdata);
                    this.storage.setItem('testObject', JSON.stringify(this.playList));
                } else {
                    for(var i = 0; i < obj.length; i++) {
                        if(mdata.url === obj[i].url){
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
        playHistoryList: function(id) {
            this.$http.get('api/detailApi.php', {
                'id': id
            }).then(function(data) {
                var music = data.data.songs[0];
                this.audio.src = music.mp3Url;
                this.audio.play();
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
            this.audio.addEventListener('ended', function() {
                alert('over');
            }, true);
        }
    }
})
