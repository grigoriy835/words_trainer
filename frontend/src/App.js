import React from "react";
import './App.css';
import * as consts from './constants'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data_loaded: false,
      game_running: false,
      category: '0',
      revers_guess_dir: true,
      categories: [],
      all_word_list: {},
      words_to_guess: [],
      current_word: null,
      guessed_words: [],
    };
    this.init_words()
  }

  async init_words() {
    try {
      let response = await fetch(consts.API_URL + 'words_list');
      let json = await response.json();
      let categories = []
      let word_list = json.reduce((map, obj) => {
            map[obj.id+1] = obj;
            categories.push(obj.category);
            return map;
          }, {});
      // console.log(json)
      this.setState({
        data_loaded: true,
        game_running: false,
        // eslint-disable-next-line array-callback-return
        'all_word_list': word_list,
        categories: Array.from(new Set(categories)),
        words_to_guess: [],
        guessed_words: [],
      })
    } catch (error) {
      console.log(error);
      return { success: false };
    }
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

    let words_to_guess = Object.values(this.state.category === "0" ?
        this.state.all_word_list :
        this.state.all_word_list.filter(word_data => {
          return word_data["category"] === this.state.category;
        }));
    shuffleArray(words_to_guess)
    let current_word = words_to_guess.pop()
    current_word = {
      word: this.state.revers_guess_dir ? current_word.translation : current_word.word,
      translation: this.state.revers_guess_dir ? current_word.word : current_word.translation,
      show_translate: false,
    };

    this.setState({
      game_running: true,
      'words_to_guess': words_to_guess,
      guessed_words: [],
      'current_word': current_word,
    });
  }

  stop_game(last_word_state = false) {
    let guessed_words = this.state.guessed_words
    guessed_words.push({...this.state.current_word, right: last_word_state})
    this.setState({game_running: false, current_word: null, words_to_guess: [], 'guessed_words': guessed_words})
  }

  show_answer() {
    let current_word = this.state.current_word;
    if (current_word) {
      current_word['show_translate'] = true;
      this.setState({'current_word': current_word})
    }
  }

  mark_word(state = false) {
    let words_to_guess = this.state.words_to_guess
    if (!words_to_guess.length) {
      this.stop_game(state);
      return
    }
    let guessed_words = this.state.guessed_words
    guessed_words.push({...this.state.current_word, right: state})

    let current_word = words_to_guess.pop()
    current_word = {
      word: this.state.revers_guess_dir ? current_word.translation : current_word.word,
      translation: this.state.revers_guess_dir ? current_word.word : current_word.translation,
      show_translate: false,
    };
    this.setState({'current_word': current_word, 'words_to_guess': words_to_guess, 'guessed_words': guessed_words})

  }

  render() {
    let translate_shown = this.state.current_word ? this.state.current_word.show_translate : true;
    return (
        <div className="App">
        <div className="central-wrap header">
          <div className="control-bar">
            <div className="choosing-cnt">
              <span>Choose category</span>
              <div className="select-cnt" >
                <select onChange={(event) => {this.state.category = event.target.value}}>
                  <option value="0">All categories</option>
                  {this.state.categories.map((category) => {
                    return <option key={category.toString()} value={category.toString()}>{category}</option>
                  })}
                </select>
              </div>
            </div>
            <div className="choosing-cnt">
              <span>Revers translate direction</span>
              <label className="switch">
                <input type="checkbox"
                       defaultChecked={this.state.revers_guess_dir}
                       onChange={(event)=>{this.state.revers_guess_dir = event.target.checked}}></input>
                  <span className="slider"></span>
              </label>
            </div>
            <div className="control-button-cnt">
              <button className={"control-button " + (this.state.data_loaded ? this.state.game_running ? "stop-button" : "start-button" : "blocked-button")}
                      onClick={()=>{if (this.state.data_loaded) {this.state.game_running ? this.stop_game() : this.run_game()}}}>
                {this.state.game_running ? 'stop' : 'run'}
              </button>
            </div>
          </div>
        </div>

        <div className="central-wrap">
          <div className="play-zone">
            <div className="words-zone">
              {
                // eslint-disable-next-line array-callback-return
                this.state.guessed_words.map((guessed_word_data,id) => {
                  let answer_class = guessed_word_data['right'] ? "right-translation" : "wrong-translation"
                  return <div key={id} className="word-row">
                           <span className="guess-word">{guessed_word_data['word']}</span>
                           <span className={answer_class}>{guessed_word_data['translation']}</span>
                         </div>
                })
              }
              {
                  this.state.current_word &&
                  <div className="word-row">
                    <span className="guess-word">{this.state.current_word['word']}</span>
                    {
                        this.state.current_word['show_translate'] &&
                        <span className="right-translation">{this.state.current_word['translation']}</span>
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
                <span className="statistic-record">statistic 1</span>
                <span className="statistic-record">statistic 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default App;
