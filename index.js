const fs = require("fs");

// taking an initial input from folder input/input.json
const inputJson = fs.readFileSync("./input/nodes.json");
// parse it
const inputNodes = JSON.parse(inputJson);

/**
 * Generic function for finding siblings
 */
const findSibling = (nodeId, mainArr, outputArr) => {
  /**
   * @param {string} nodeId - nodeId of first element with previousSiblingId: null
   * @param {Array} mainArr - main array where to find next sibling
   * @param {Array} outputArr - output array where to push next sibling
   * @returns {Array} - array where all siblings will be sorted
   */

  // finding a node with previousSiblingId the same as nodeId
  const sibling = mainArr.find((node) => node.previousSiblingId === nodeId);

  if (sibling) {
    // push to new array the sibling
    outputArr.push(sibling);

    // Searching for next sibling
    findSibling(sibling.nodeId, mainArr, outputArr);
  }

  if (!sibling) {
    // if there is no next sibling, return output array
    return outputArr;
  }
};

/**
 * Generic function for finding children
 */
const searchChildren = (nodeId, nodesArr) => {
  /**
   * @param {string} nodeId - parent nodeId
   * @param {nodesArr} - array with all nodes
   * @returns {Array} with children property wich have inner children
   */
  const arrSortedBySiblings = [];

  // we are receiving array of all children with parentId the same as parent nodeId
  // but this array is not filtered by siblings
  const arrOfUnfilteredChildren = nodesArr.filter(
    (node) => node.parentId === nodeId
  );

  if (!arrOfUnfilteredChildren.length) {
    // if there is no children we return empty length
    return [];
  }

  // iterate over the arrOfUnfilteredChildren to sort them by previousSiblingId
  for (let i = 0; i < arrOfUnfilteredChildren.length; i++) {
    // finding first element which doesn`t have siblings
    // it means that he should be first in an array
    if (arrOfUnfilteredChildren[i].previousSiblingId === null) {
      arrSortedBySiblings.push(arrOfUnfilteredChildren[i]);

      // find next sibling and push it to the arrOfUnfilteredChildren
      findSibling(
        arrOfUnfilteredChildren[i].nodeId,
        arrOfUnfilteredChildren,
        arrSortedBySiblings
      );
    }
  }

  if (arrSortedBySiblings.length) {
    return arrSortedBySiblings.map((node) => {
      // recursion
      // runs the same function with chil nodeId to get to know his children and right it down in his property children
      node.children = searchChildren(node.nodeId, nodesArr);
      return node;
    });
  }
};

const serializeNode = (nodesArr) => {
  /**
   * @param {Object[]} nodesArr
   * @property {string} nodeId
   * @property {string} name
   * @property {string|null} parentId
   * @property {string|null} previousSiblingId
   */

  const resultArr = [];

  // Filtering initial array to have an array only of root nodes with parentId === null
  const rootArr = nodesArr.filter((node) => {
    if (node.parentId === null) {
      // searching for a children and right it into new property children
      node.children = searchChildren(node.nodeId, nodesArr);
      return true;
    }
  });

  // iterating over the array of roots nodes and sorting them by previousSiblingId
  for (let i = 0; i < rootArr.length; i++) {
    if (rootArr[i].previousSiblingId === null) {
      resultArr.push(rootArr[i]);

      findSibling(rootArr[i].nodeId, rootArr, resultArr);
    }
  }

  return resultArr;
};

// wright down the result in JSON
const jsonResult = JSON.stringify(serializeNode(inputNodes), null, 2);

// creating a file with output by path /result/result.json
fs.writeFileSync("./result/result.json", jsonResult);
