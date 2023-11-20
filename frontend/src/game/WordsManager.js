import React, {useState} from "react";
import './WordsManager.css'

const EditableItem = ({item, onSave, categories}) => {
    const [editedItem, setEditedItem] = useState({...item});
    const [notSaved, setNotSaved] = useState(!item.id)

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNotSaved(true)
        setEditedItem((prevItem) => ({...prevItem, [name]: value}));
    };

    const handleSave = async () => {
        const res = await onSave(editedItem);
        if (res && item.id) setNotSaved(false)
    };

    const handleDelete = async () => {
        const res = await onSave({...editedItem, category: "deleted"});
        if (res) setNotSaved(false)
    };

    return (
        <div className={"editable-item " + (notSaved ? "not-saved" : "")} key={editedItem.id}>
            <span>{editedItem.id}</span>
            <div>
                Word:
                <input type="text" name="word" value={editedItem.word} onChange={handleInputChange}/>
            </div>
            <div>
                Translation:
                <input type="text" name="translation" value={editedItem.translation} onChange={handleInputChange}/>
            </div>
            <div>
                <select className="category-dropdown" name="category" value={editedItem.category}
                        onChange={handleInputChange}>
                    {categories.map((category) => {
                        return <option key={category.toString()} value={category.toString()}>{category}</option>
                    })}
                </select>
            </div>
            {!item.new &&
                <button className="save-button" onClick={handleSave}>
                    Save
                </button>}
            {!item.new && item.id &&
                <button className="save-button delete-button" onClick={handleDelete}>
                    Delete
                </button>}
        </div>
    );
};

const WordsManager = ({words_list, categories, save_word_hook}) => {
    const [words, setWords] = useState({...words_list, 0: {id: '', word: '', translation: '', category: 'default'}})

    const updateList = async (savingItem) => {
        await save_word_hook(savingItem)
        if (savingItem.category === 'deleted') {
            const newWords = {...words}
            delete newWords[savingItem.id]
            setWords(newWords)
        }
        if (!savingItem.id) {
            const newItem = {...savingItem, id: 1 + Number(Object.keys(words).pop()), new: true}
            const newWords = {...words}
            savingItem.word = ''
            savingItem.translation = ''
            newWords[newItem.id] = newItem
            setWords(newWords)
        }
    }

    return (
        <div className="central-wrap">
            <div className="edit_words-zone">
                {Object.values(words).map((item) => (
                    <EditableItem key={item.id} item={item} onSave={updateList} categories={categories}/>
                ))}
            </div>
        </div>
    )
}


export default WordsManager