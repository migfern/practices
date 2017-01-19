/*
 * The parse tree is made up of instances of ProgramNode subclasses such as
 * StatementNode, ExpressionNode, and so forth. The ProgramNode hierarchy is an
 * example of the Composite (183) pattern. ProgramNode defines an interface for
 * manipulating the program node and its children, if any.
 */
class ProgramNode {
    public:
        // program node manipulation
        virtual void GetSourcePosition(int& line, int& index);
        // ...
        
        
        // child manipulation
        virtual void Add(ProgramNode*);
        virtual void Remove(ProgramNode*);
        /*
         * The Traverse operation takes a CodeGenerator object. ProgramNode subclasses use
         * this object to generate machine code in the form of Bytecode objects on a
         * BytecodeStream.
         */
        virtual void Traverse(CodeGenerator&);
        
     protected:
        ProgramNode();
};
