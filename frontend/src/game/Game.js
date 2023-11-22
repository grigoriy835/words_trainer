import React from "react";
import './Game.css';
import './WordsManager'
import * as consts from '../constants'
import WordsManager from "./WordsManager";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data_loaded: false,
            game_running: false,
            revers_guess_dir: true,
            editing: false,
            category: "default",
            categories: [],
            all_word_list: {},
            game_status: {
                play_accuracy: null,
                words_to_guess: [],
                current_word: null,
                guessed_words: [],
            }
        };
    }

    componentDidMount() {
        this.init_words()
    }

    async init_words() {
        try {
            let response = await fetch(consts.API_URL + 'words_list');
            let json = await response.json();
            let categories = []
            let word_list = json.reduce((map, obj) => {
                map[obj.id] = obj;
                categories.push(obj.category);
                return map;
            }, {});
            this.setState({
                data_loaded: true,
                all_word_list: word_list,
                categories: Array.from(new Set(categories)),
            })
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }

    get_words_to_guess() {
        return this.state.category === "0" ?
            Object.values(this.state.all_word_list) :
            Object.values(this.state.all_word_list).filter(word_data => {
                return word_data["category"] === this.state.category;
            });
    }

    run_game() {
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                let temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }

        let words_to_guess = this.get_words_to_guess();
        if (!words_to_guess) {
            return
        }
        shuffleArray(words_to_guess)
        let current_word = words_to_guess.pop()
        current_word = {
            word: this.state.revers_guess_dir ? current_word.translation : current_word.word,
            translation: this.state.revers_guess_dir ? current_word.word : current_word.translation,
            show_translate: false,
        };

        this.setState({
            game_running: true,
            game_status: {
                play_accuracy: null,
                words_to_guess: words_to_guess,
                current_word: current_word,
                guessed_words: [],
            },
        });
    }

    stop_game(last_word_state = false) {
        let guessed_words = this.state.game_status.guessed_words
        guessed_words.push({...this.state.game_status.current_word, right: last_word_state})
        this.setState({
            game_running: false,
            game_status: {
                play_accuracy: guessed_words.reduce((acc, val) => {return acc + val.right}, 0)/guessed_words.length,
                words_to_guess: [],
                current_word: null,
                guessed_words: guessed_words,
            },
        })
    }

    show_answer() {
        let current_word = this.state.game_status.current_word;
        if (current_word) {
            current_word['show_translate'] = true;
            this.setState({
                game_status: {
                    ...this.state.game_status,
                    current_word: current_word
                }
            })
        }
    }

    mark_word(state = false) {
        let game_status = this.state.game_status
        let words_to_guess = game_status.words_to_guess
        if (!words_to_guess.length) {
            this.stop_game(state);
            return
        }
        let guessed_words = game_status.guessed_words
        guessed_words.push({...game_status.current_word, right: state})


        let current_word = words_to_guess.pop()
        current_word = {
            word: this.state.revers_guess_dir ? current_word.translation : current_word.word,
            translation: this.state.revers_guess_dir ? current_word.word : current_word.translation,
            show_translate: false,
        };
        this.setState({
            game_status: {
                play_accuracy: guessed_words.reduce((acc, val) => {return acc + val.right}, 0)/guessed_words.length,
                current_word: current_word,
                words_to_guess: words_to_guess,
                guessed_words: guessed_words
            }
        })

    }
    async update_word(item) {
        let response = await fetch(consts.API_URL + 'save_word',
            {method: 'POST', body: JSON.stringify(item)})
        return response.response === 200;
    }

    render() {
        let game_status = this.state.game_status
        let translate_shown = game_status.current_word ? game_status.current_word.show_translate : true;
        let words_ready = this.state.data_loaded && this.get_words_to_guess().length
        return (
            <div className="App">
                <div className="central-wrap header">
                    <div className="control-bar">
                        <div className="choosing-cnt">
                            <span>Choose category</span>
                            <div className="select-cnt" >
                                <select className="select-category" value={this.state.category} onChange={(event) => {this.setState({category: event.target.value})}}>
                                    <option value="0">All categories</option>
                                    {this.state.categories.map((category) => {
                                        return <option key={category.toString()} value={category.toString()}>{category}</option>
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="control-button-cnt">
                            <button className={"control-button " + (this.state.editing ? "stop-button" : "start-button")}
                                    onClick={()=>{if (this.state.data_loaded) {this.setState({editing: !this.state.editing}); this.init_words()}}}>
                                Edit words
                            </button>
                        </div>

                        <div className="control-button-cnt">
                            <button className={"control-button " + (words_ready  ? this.state.game_running ? "stop-button" : "start-button" : "blocked-button")}
                                    onClick={()=>{if (words_ready) {this.state.game_running ? this.stop_game() : this.run_game()}}}>
                                {this.state.game_running ? 'stop' : 'run'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="central-wrap">
                    {!this.state.editing &&
                        <div className={"play-zone"} >
                            <div className="words-zone">
                                {
                                    game_status.guessed_words.map((guessed_word_data,id) => {
                                        let answer_class = guessed_word_data['right'] ? "right-translation" : "wrong-translation"
                                        return <div key={id} className="word-row">
                                            <span className="guess-word">{guessed_word_data['word']}</span>
                                            <span className={"guess-translation " + answer_class}>{guessed_word_data['translation']}</span>
                                        </div>
                                    })
                                }
                                {
                                    game_status.current_word &&
                                    <div className="word-row">
                                        <span className="guess-word">{game_status.current_word['word']}</span>
                                        {
                                            game_status.current_word['show_translate'] &&
                                            <span className="guess-translation right-translation">{game_status.current_word['translation']}</span>
                                        }
                                    </div>
                                }

                            </div>

                            <div className="info-zone column">
                                <div className="play-button-zone column">
                                    <button
                                        className={'play-button ' + (this.state.game_running ? "right-button" : "blocked-button")}
                                        onClick={() => {if (this.state.game_running) {translate_shown ? this.mark_word(true) : this.show_answer()}}}
                                    >{translate_shown ? 'right' : 'show'}</button>
                                    <button className={'play-button ' + (this.state.game_running ? "wrong-button" : "blocked-button")}
                                            onClick={() => {if (this.state.game_running) {this.mark_word(false);}}}
                                    >{translate_shown ? 'wrong' : 'skip'}</button>
                                </div>

                                <div className="statistic column">
                                    <span className="statistic-record">words active: {this.state.game_running ? game_status.guessed_words.length + game_status.words_to_guess.length + 1 : this.get_words_to_guess().length}</span>
                                    <span className="statistic-record">words to guess: {this.state.game_running ? game_status.words_to_guess.length+1 : 0}</span>
                                    <span className="statistic-record">accuracy {this.state.game_status.play_accuracy === null ? 'N/A' : Math.round(this.state.game_status.play_accuracy*100) + '%'}</span>
                                </div>

                                <div className="choosing-cnt">
                                    <span>Revers translate direction</span>
                                    <label className="switch">
                                        <input type="checkbox"
                                               defaultChecked={this.state.revers_guess_dir}
                                               onChange={(event)=>{this.setState({revers_guess_dir: event.target.checked})}}></input>
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                {!words_ready &&
                                    <span className="stop-button">
                                        No words found
                                    </span>}

                            </div>
                        </div>
                    }
                    {this.state.editing && <WordsManager
                    words_list={this.state.all_word_list}
                    categories={this.state.categories}
                    save_word_hook={this.update_word}
                />}

                </div>
            </div>

        );
    }
}

export default Game