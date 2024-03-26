document.addEventListener('DOMContentLoaded', function() {
  let noteForm;
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let clearBtn;
  let noteList;
  let activeNote = {};
  let notes = []; 

  // Function declarations
  const show = (elem) => {
    elem.style.display = 'inline';
  };

  const hide = (elem) => {
    elem.style.display = 'none';
  };

  const getNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      notes = await response.json(); 
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  };

  const saveNote = async (note) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
      const savedNote = await response.json();
      return savedNote;
    } catch (error) {
      console.error('Error saving note:', error);
      return null;
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renderActiveNote = () => {
    if (activeNote.id) {
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
      saveNoteBtn.style.display = 'none';
      clearBtn.style.display = 'inline';
    } else {
      noteTitle.value = '';
      noteText.value = '';
      saveNoteBtn.style.display = 'inline';
      clearBtn.style.display = 'none';
    }
  };

  const handleNoteSave = async () => {
    const note = {
      title: noteTitle.value,
      text: noteText.value,
    };
    const savedNote = await saveNote(note);
    if (savedNote) {
      activeNote = savedNote; 
      renderActiveNote(); 
      await getAndRenderNotes(); 
    }
  };
  const getAndRenderNotes = async () => {
    try {
      const notes = await getNotes(); 
      renderNoteList(notes); 
    } catch (error) {
      console.error('Error getting and rendering notes:', error);
    }
  };

  const handleNoteDelete = async (id) => {
    await deleteNote(id);
    await getAndRenderNotes();
  };
  
  const handleNoteView = (e) => {
    const noteId = e.target.dataset.noteId;
    const selectedNote = notes.find(note => note.id === noteId);
    if (selectedNote) {
      noteTitle.value = selectedNote.title;
      noteText.value = selectedNote.text;
      activeNote = selectedNote;
    } else {
      console.error('Selected note not found');
    }
  };
  
  const handleNewNoteView = () => {
    noteTitle.value = '';
    noteText.value = '';
    activeNote = {};
  };
  
  const handleRenderBtns = () => {
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(saveNoteBtn);
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      show(clearBtn);
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
      show(clearBtn);
    }
  };
  
  const renderNoteList = (notes) => {
    noteList.innerHTML = ''; // Clear existing list
    notes.forEach(note => {
      const li = document.createElement('li');
      li.classList.add('list-group-item');
      li.innerText = note.title;
      li.dataset.noteId = note.id;
      li.addEventListener('click', handleNoteView);
      noteList.appendChild(li);
    });
    renderActiveNote(); // Call renderActiveNote after rendering note list
  };

  // DOM element queries and event listeners
  if (window.location.pathname === '/notes') {
    noteForm = document.querySelector('.note-form');
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    clearBtn = document.querySelector('.clear-btn');
    noteList = document.querySelectorAll('.list-container .list-group');
    
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    clearBtn.addEventListener('click', renderActiveNote);
    noteForm.addEventListener('input', handleRenderBtns);
  }

  getAndRenderNotes(); // Call getAndRenderNotes to fetch and render notes on page load
});
