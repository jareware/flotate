/* @flow */
function foo() {
    /* flow-ignore-begin*/
    this.doingIllegalThings();
    /* flow-ignore-end*/
    alert('Yay!');
}
