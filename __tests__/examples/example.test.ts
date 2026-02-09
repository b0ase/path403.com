/**
 * Example Tests
 *
 * These demonstrate testing patterns for the application
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Example 1: Testing a utility function
 */
describe('String Utilities Example', () => {
  it('should capitalize first letter', () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle empty strings', () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    expect(capitalize('')).toBe('');
  });

  it('should handle single character', () => {
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    expect(capitalize('a')).toBe('A');
  });
});

/**
 * Example 2: Testing an async function
 */
describe('Async Function Example', () => {
  it('should fetch user data', async () => {
    const fetchUser = async (id: string) => {
      return { id, name: 'John Doe', email: 'john@example.com' };
    };

    const user = await fetchUser('123');
    expect(user.id).toBe('123');
    expect(user.name).toBe('John Doe');
  });

  it('should handle errors', async () => {
    const fetchUser = async (id: string) => {
      if (!id) throw new Error('ID required');
      return { id, name: 'John' };
    };

    await expect(fetchUser('')).rejects.toThrow('ID required');
  });
});

/**
 * Example 3: Testing with mocks
 */
describe('Mocking Example', () => {
  it('should call mock function', () => {
    const mockFunction = vi.fn().mockReturnValue('mocked value');
    const result = mockFunction('arg1', 'arg2');

    expect(mockFunction).toHaveBeenCalled();
    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(result).toBe('mocked value');
  });

  it('should mock async function', async () => {
    const mockAsync = vi.fn().mockResolvedValue({ data: 'test' });
    const result = await mockAsync();

    expect(result).toEqual({ data: 'test' });
  });
});

/**
 * Example 4: Testing with setup and cleanup
 */
describe('Setup and Cleanup Example', () => {
  let mockValue: number;

  beforeEach(() => {
    mockValue = 10;
  });

  it('should have initial value', () => {
    expect(mockValue).toBe(10);
  });

  it('should modify value', () => {
    mockValue = 20;
    expect(mockValue).toBe(20);
  });

  it('should reset value after each test', () => {
    // mockValue is reset to 10 because beforeEach runs again
    expect(mockValue).toBe(10);
  });
});

/**
 * Example 5: Testing object comparisons
 */
describe('Object Comparison Example', () => {
  it('should compare objects deeply', () => {
    const obj1 = { name: 'John', age: 30 };
    const obj2 = { name: 'John', age: 30 };

    expect(obj1).toEqual(obj2); // Deep equality
    expect(obj1).not.toBe(obj2); // Same reference
  });

  it('should match partial objects', () => {
    const user = { id: '123', name: 'John', email: 'john@example.com', role: 'admin' };

    expect(user).toMatchObject({
      id: '123',
      name: 'John',
    });
  });
});

/**
 * Example 6: Testing array operations
 */
describe('Array Operations Example', () => {
  it('should include item in array', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toContain(3);
  });

  it('should have correct length', () => {
    const arr = ['a', 'b', 'c'];
    expect(arr).toHaveLength(3);
  });

  it('should filter array correctly', () => {
    const numbers = [1, 2, 3, 4, 5];
    const even = numbers.filter(n => n % 2 === 0);

    expect(even).toEqual([2, 4]);
    expect(even).toHaveLength(2);
  });
});

/**
 * Example 7: Testing error handling
 */
describe('Error Handling Example', () => {
  it('should throw error for invalid input', () => {
    const validate = (email: string) => {
      if (!email.includes('@')) throw new Error('Invalid email');
      return true;
    };

    expect(() => validate('notanemail')).toThrow('Invalid email');
  });

  it('should catch specific error type', () => {
    class CustomError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = 'CustomError';
      }
    }

    const throwError = () => {
      throw new CustomError('Custom error message');
    };

    expect(throwError).toThrow(CustomError);
  });
});

/**
 * Example 8: Testing with test.each for multiple cases
 */
describe.each([
  ['apple', 'fruit'],
  ['carrot', 'vegetable'],
  ['fish', 'protein'],
])('Food categorization', (food, expected) => {
  it(`${food} should be categorized as ${expected}`, () => {
    const foodCategories: Record<string, string> = {
      apple: 'fruit',
      carrot: 'vegetable',
      fish: 'protein',
    };

    expect(foodCategories[food]).toBe(expected);
  });
});

/**
 * Example 9: Testing with snapshots
 */
describe('Snapshot Example', () => {
  it('should match snapshot', () => {
    const obj = {
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date('2024-01-01'),
    };

    // First run creates snapshot, subsequent runs compare
    expect(obj).toMatchSnapshot();
  });
});

/**
 * Example 10: Custom matchers
 */
describe('Custom Matcher Example', () => {
  it('should use custom matcher', () => {
    // Using custom matchers defined in setup
    const value = 50;
    expect(value).toBeWithinRange(40, 60);
  });
});

/**
 * Example 11: Testing with describe blocks for organization
 */
describe('Complex Feature', () => {
  describe('Creation', () => {
    it('should create with valid data', () => {
      expect(true).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(false).toBe(false);
    });
  });

  describe('Deletion', () => {
    it('should delete existing item', () => {
      expect(true).toBe(true);
    });

    it('should not delete non-existent item', () => {
      expect(false).toBe(false);
    });
  });

  describe('Updating', () => {
    it('should update existing item', () => {
      expect(true).toBe(true);
    });

    it('should handle concurrent updates', () => {
      expect(true).toBe(true);
    });
  });
});
