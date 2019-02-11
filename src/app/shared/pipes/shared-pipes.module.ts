import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupByPipe } from './GroupBy.pipe';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [GroupByPipe],
    exports: [GroupByPipe]
})
export class SharedPipesModule { }
