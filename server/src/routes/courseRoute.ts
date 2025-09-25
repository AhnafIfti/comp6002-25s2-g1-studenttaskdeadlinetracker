import express from 'express';
import { getCourses, addCourse, editCourse, deleteCourse, getCourseByCode } from '../controllers/courseController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticate, getCourses);

router.post('/add', authenticate, addCourse);

router.put('/:id', authenticate, editCourse);

router.delete('/:id', authenticate, deleteCourse);

router.get('/code/:courseCode',authenticate, getCourseByCode);

export default router;