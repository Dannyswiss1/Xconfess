import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { AnonymousUser } from '../user/entities/anonymous-user.entity';

// Custom request type with user
interface RequestWithUser extends ExpressRequest {
  user?: any;
}

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly service: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':confessionId')
  @ApiOperation({ summary: 'Create a comment on a confession' })
  @ApiParam({ name: 'confessionId', description: 'Confession UUID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Param('confessionId') confessionId: string,
    @Body('content') content: string,
    @Req() req: RequestWithUser,
    @Body('anonymousContextId') anonymousContextId: string,
    @Body('parentId') parentId?: number,
  ) {
    const user = req.user as AnonymousUser;
    return this.service.create(
      content,
      user,
      confessionId,
      anonymousContextId,
      parentId,
    );
  }

  @Get('by-confession/:confessionId')
  @ApiOperation({ summary: 'List comments for a confession with cursor pagination' })
  @ApiParam({ name: 'confessionId', description: 'Confession UUID' })
  @ApiQuery({ name: 'cursor', required: false, description: 'Pagination cursor' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated comments.' })
  findByConfession(
    @Param('confessionId') confessionId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const l = limit ? Number(limit) : undefined;
    return this.service.findByConfessionId(confessionId, { cursor, limit: l });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID (numeric)' })
  @ApiResponse({ status: 200, description: 'Comment deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user as AnonymousUser;
    return this.service.delete(+id, user);
  }

}
