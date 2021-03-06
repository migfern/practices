class GlyphContext {
    public:
        GlyphContext();
        
        virtual ~GlyphContext();
        virtual void Next(int step = 1);
        virtual void Insert(int quantity = 1);
        virtual Font* GetFont();
        virtual void SetFont(Font*, int span = 1);
        /*
         * GlyphContext gc;
         * Font* times12 = new Font("Times-Roman-12");
         * Font* timesItalic12 = new Font("Times-Italic-12");
         * // ...
         * gc.SetFont(times12, 6);
         * gc.Insert(6);
         * gc.SetFont(timesItalic12, 6);
         */
    private:
        int _index;
        BTree* _fonts;
};
