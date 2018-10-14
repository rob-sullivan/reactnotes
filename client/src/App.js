import React, { Component } from 'react';
import Note from "./Note/Note";
import NoteForm from "./NoteForm/NoteForm";
import { DB_CONFIG } from './Config/config';
import firebase from 'firebase/app';
import 'firebase/database';
import './App.css';

class App extends Component {

    //this method gets called first.
    constructor(props) {
        super(props);
        this.addNote = this.addNote.bind(this);
        this.removeNote = this.removeNote.bind(this);

        this.app = firebase.initializeApp(DB_CONFIG);
        this.database = this.app.database().ref().child('notes');

        //setup the react state of notes component
        this.state = {
            notes: [],
        }
    }

    componentWillMount() {
        const previousNotes = this.state.notes;

        //data from firestore is pulled into data snapshot object
        //snap.val() is used to inspect that object
        this.database.on('child_added', snap => {
            previousNotes.push({
                id: snap.key,
                noteContent: snap.val().noteContent,
            })

            //update state with new array
            this.setState({
                notes: previousNotes
            })
        })

        //when a child is removed from firestore find it in
        // our array and remove it
        this.database.on('child_removed', snap => {
            for (var i = 0; i < previousNotes.length; i++) {
                if (previousNotes[i].id === snap.key) {
                    previousNotes.splice(i, 1);
                }
            }

            //update state with new array
            this.setState({
                notes: previousNotes
            })
        })

    }

    addNote(note) {
        this.database.push().set({ noteContent: note });
    }

    removeNote(noteId) {
        this.database.child(noteId).remove();
    }

    render() {
        return (
            <div className="notesWrapper">
                <div className="notesHeader">
                    <div className="heading">React & Firebase To-Do List</div>
                </div>
                <div className="notesBody">
                    {
                        this.state.notes.map((note) => {
                            return (
                                <Note
                                    noteContent={note.noteContent}
                                    noteId={note.id}
                                    key={note.id}
                                    removeNote={this.removeNote}
                                />
                            )
                        })
                    }
                </div>
                <div className="notesFooter">
                    <NoteForm addNote={this.addNote} />
                </div>

            </div>
        );
    }
}

export default App;
