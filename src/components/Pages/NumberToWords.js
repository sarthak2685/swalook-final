// numberToWords.js

const NumberToWords = (num) => {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
  
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
  
    const scales = ['', 'Thousand', 'Million', 'Billion'];
  
    const numToString = (num) => {
      if (num === 0) return 'Zero';
      let str = '';
      for (let i = 0; num > 0; i++) {
        if (num % 1000 !== 0) {
          str = helper(num % 1000) + scales[i] + ' ' + str;
        }
        num = Math.floor(num / 1000);
      }
      return str.trim();
    };
  
    const helper = (num) => {
      if (num === 0) return '';
      if (num < 20) {
        return ones[num] + ' ';
      }
      if (num < 100) {
        return tens[Math.floor(num / 10)] + ' ' + ones[num % 10] + ' ';
      }
      return ones[Math.floor(num / 100)] + ' Hundred ' + helper(num % 100);
    };
  
    return numToString(num);
  };
  
  export default NumberToWords;
  