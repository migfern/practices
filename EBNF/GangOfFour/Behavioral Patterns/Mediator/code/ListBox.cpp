class ListBox : public WIdget {
    public:
        ListBox(DialogDirector*);
        
        virtual const char* GetSelection();
        virtual void SetList(List<char*>* listItems);
        virtual void HandleMouse(MouseEvent& event);
        // ...
        
};
