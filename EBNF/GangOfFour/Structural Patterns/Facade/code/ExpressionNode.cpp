class ExpressionNode {
    public:
        void ExpressionNode::Traverse (CodeGenerator& cg) {
        
            cg.Visit(this);
            ListIterator i(_children);
            
            for (i.First(); !i.IsDone(); i.Next()) {
                i.CurrentItem()->Traverse(cg);
            }
            
        }
};
