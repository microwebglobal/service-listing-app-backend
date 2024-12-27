class IdGenerator {
  static generateId(prefix, existingIds) {
    // Handle case when existingIds is empty or null
    if (!existingIds || existingIds.length === 0) {
      return `${prefix}001`;
    }

    // Filter valid IDs and extract numbers
    const numbers = existingIds
      .filter(id => id && id.startsWith(prefix))
      .map(id => {
        const numStr = id.replace(prefix, '');
        const num = parseInt(numStr);
        return isNaN(num) ? 0 : num;
      })
      .filter(num => !isNaN(num));

    // Handle case when no valid numbers were found
    if (numbers.length === 0) {
      return `${prefix}001`;
    }

    // Find the maximum number and increment
    const maxNumber = Math.max(...numbers);
    const newNumber = (maxNumber + 1).toString().padStart(3, '0');

    return `${prefix}${newNumber}`;
  }

  // Helper method to verify if an ID already exists
  static async verifyUniqueId(prefix, model, idField, existingIds) {
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      const generatedId = this.generateId(prefix, existingIds);
      
      // Check if ID exists in database
      const exists = await model.findOne({
        where: {
          [idField]: generatedId
        }
      });
      
      if (!exists) {
        return generatedId;
      }
      
      // Add the found ID to existing IDs for next iteration
      existingIds.push(generatedId);
      attempts++;
    }
    
    throw new Error(`Unable to generate unique ID after ${maxAttempts} attempts`);
  }
}

module.exports = IdGenerator;