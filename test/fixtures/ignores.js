/* @flow */
function foo() {
    /*:flow-begin-ignore*/
    this.doingIllegalThings();
    /*:flow-end-ignore*/
    alert('Yay!');
}
