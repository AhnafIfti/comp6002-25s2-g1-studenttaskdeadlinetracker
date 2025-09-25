import { Request, Response } from 'express';
import Course from '../model/course';
import Task from '../model/task';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
  
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized. User ID is required.' }); // unauthorized
        return;
      }
  
      const courses = await Course.find({ userId });
  
      res.status(200).json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

export const addCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;
    const userId = req.user?.id;

    if (!name || !code) {
      res.status(400).json({ message: 'Name and code are required.' });
      return;
    }

    const existingCourse = await Course.findOne({ code, userId });
    if (existingCourse) {
      res.status(400).json({ message: 'Course with this code already exists.' });
      return;
    }

    const newCourse = new Course({
      name,
      code,
      userId,
    });

    await newCourse.save();

    res.status(201).json({ message: 'Course added successfully.', course: newCourse });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const editCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params; 
      const { name, code } = req.body; 
      const userId = req.user?.id; 
  
      if (!name || !code) {
        res.status(400).json({ message: 'Name and code are required.' });
        return;
      }
  
      
      const updatedCourse = await Course.findOneAndUpdate(
        { _id: id, userId }, 
        { name, code },
        { new: true } 
      );
  
      if (!updatedCourse) {
        res.status(404).json({ message: 'Course not found or not authorized.' });
        return;
      }
  
      res.status(200).json({ message: 'Course updated successfully.', course: updatedCourse });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

  export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, courseId } = req.params; 
      const userId = req.user?.id; 
  
      
      const deletedCourse = await Course.findOneAndDelete({ _id: id, userId });
  
      if (!deletedCourse) {
        res.status(404).json({ message: 'Course not found or not authorized.' });
        return;
      }
      await Task.deleteMany({ courseId });

      res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

  export const getCourseByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseCode } = req.params;
      const course = await Course.findOne({ code: courseCode });
  
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
  
      res.status(200).json({ id: course._id });
    } catch (error) {
      console.error('Error fetching course by code:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };